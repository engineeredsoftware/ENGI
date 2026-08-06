"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveArtifact = saveArtifact;
exports.putArtifactAtKey = putArtifactAtKey;
function toArtifactInfo(key, buffer) {
    const bytes = typeof buffer === 'string' ? Buffer.byteLength(buffer) : buffer.byteLength;
    return {
        url: `mock://artifacts/${key}`,
        size: bytes,
        name: key
    };
}
async function saveArtifact(buffer, name, _contentType) {
    return toArtifactInfo(name, buffer);
}
async function putArtifactAtKey(key, buffer, _contentType) {
    return toArtifactInfo(key, buffer);
}
