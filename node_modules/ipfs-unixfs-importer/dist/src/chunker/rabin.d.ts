import type { Chunker } from './index.js';
export interface RabinOptions {
    minChunkSize?: number;
    maxChunkSize?: number;
    avgChunkSize?: number;
    window?: number;
}
export declare const rabin: (options?: RabinOptions) => Chunker;
//# sourceMappingURL=rabin.d.ts.map