export interface ArtifactInfo {
  url: string;
  size: number;
  name: string;
  etag?: string;
}

function toArtifactInfo(key: string, buffer: Uint8Array | string): ArtifactInfo {
  const bytes = typeof buffer === 'string' ? Buffer.byteLength(buffer) : buffer.byteLength;
  return {
    url: `mock://artifacts/${key}`,
    size: bytes,
    name: key
  };
}

export async function saveArtifact(buffer: Uint8Array | string, name: string, _contentType?: string): Promise<ArtifactInfo> {
  return toArtifactInfo(name, buffer);
}

export async function putArtifactAtKey(
  key: string,
  buffer: Uint8Array | string,
  _contentType?: string
): Promise<ArtifactInfo> {
  return toArtifactInfo(key, buffer);
}
