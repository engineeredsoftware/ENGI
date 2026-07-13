declare module '@bitcode/artifacts' {
  export interface ArtifactInfo {
    url: string;
    size: number;
    name: string;
    etag?: string;
  }

  export function saveArtifact(buffer: Uint8Array | string, name: string, contentType?: string): Promise<ArtifactInfo>;
  export function putArtifactAtKey(
    key: string,
    buffer: Uint8Array | string,
    contentType?: string
  ): Promise<ArtifactInfo>;
}
