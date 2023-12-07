export interface ChunkValidator {
    (source: AsyncIterable<Uint8Array>): AsyncIterable<Uint8Array>;
}
export declare const defaultChunkValidator: () => ChunkValidator;
//# sourceMappingURL=validate-chunks.d.ts.map