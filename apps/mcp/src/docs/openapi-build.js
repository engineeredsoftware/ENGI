"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const openapi_generator_1 = require("./openapi-generator");
function main() {
    const spec = (0, openapi_generator_1.generateOpenAPISpec)();
    const outDir = (0, path_1.join)(__dirname, '..', '..', 'docs', 'openapi');
    const outFile = (0, path_1.join)(outDir, 'bitcode-mcp-openapi.json');
    if (!(0, fs_1.existsSync)(outDir))
        (0, fs_1.mkdirSync)(outDir, { recursive: true });
    (0, fs_1.writeFileSync)(outFile, JSON.stringify(spec, null, 2), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`✅ OpenAPI JSON written to ${outFile}`);
}
main();
