"use strict";
const path = require("path");
const utilities_1 = require("../utilities");
const utilities_2 = require("./utilities");
function stringify(structure, previousIndentation) {
    const nextIndentation = previousIndentation + utilities_1.indentation;
    let content = "";
    for (const key of Object.keys(structure).sort()) {
        content += `
${nextIndentation}${key}: `;
        const exported = structure[key];
        if (typeof exported === "string") {
            content += exported;
        }
        else {
            content += stringify(exported, nextIndentation);
        }
        content += ",";
    }
    return `{${content}
${previousIndentation}}`;
}
function buildStructureSubsection(structure, pathParts, name, reference) {
    const pathPart = pathParts.shift();
    let subsection = pathPart === "." ? structure : structure[pathPart];
    if (!subsection) {
        subsection = {};
        structure[pathPart] = subsection;
    }
    if (pathParts.length === 0) {
        subsection[name] = reference;
    }
    else {
        buildStructureSubsection(subsection, pathParts, name, reference);
    }
}
function compareImports(a, b) {
    if (a.path < b.path) {
        return -1;
    }
    if (a.path > b.path) {
        return 1;
    }
    return 0;
}
function buildFileSystemBarrel(directory, modules) {
    const structure = {};
    let content = "";
    modules
        .map((module) => ({ module, path: utilities_2.buildImportPath(directory, module) }))
        .sort(compareImports)
        .forEach((imported) => {
        const relativePath = path.relative(directory.path, imported.module.path);
        const directoryPath = path.dirname(relativePath);
        const parts = directoryPath.split(path.sep);
        const alias = relativePath.replace(utilities_1.nonAlphaNumeric, "");
        content += `import * as ${alias} from "${imported.path}";
`;
        const fileName = path.basename(imported.module.name, ".ts");
        buildStructureSubsection(structure, parts, fileName, alias);
    });
    for (const key of Object.keys(structure).sort()) {
        const exported = structure[key];
        if (typeof exported === "string") {
            content += `export {${exported} as ${key}};
`;
        }
        else {
            content += `export const ${key} = ${stringify(exported, "")};
`;
        }
    }
    return content;
}
exports.buildFileSystemBarrel = buildFileSystemBarrel;
//# sourceMappingURL=fileSystem.js.map