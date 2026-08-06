"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleSystemTextSearch = void 0;
exports.simpleSystemTextSearch = {
    async execute(args) {
        const max = args.maxResults ?? 1;
        return Array.from({ length: max }).map((_, index) => ({
            file: `${args.cwd ?? 'repo'}/mock-file-${index}.ts`,
            line: index,
            text: `match for ${args.pattern}`
        }));
    }
};
