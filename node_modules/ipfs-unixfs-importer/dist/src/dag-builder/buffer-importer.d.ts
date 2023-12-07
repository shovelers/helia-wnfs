import type { BufferImporter } from '../index.js';
import type { CID, Version } from 'multiformats/cid';
import type { ProgressOptions, ProgressEvent } from 'progress-events';
/**
 * Passed to the onProgress callback while importing files
 */
export interface ImportWriteProgress {
    /**
     * How many bytes we have written for this source so far - this may be
     * bigger than the file size due to the DAG-PB wrappers of each block
     */
    bytesWritten: bigint;
    /**
     * The CID of the block that has been written
     */
    cid: CID;
    /**
     * The path of the file being imported, if one was specified
     */
    path?: string;
}
export type BufferImportProgressEvents = ProgressEvent<'unixfs:importer:progress:file:write', ImportWriteProgress>;
export interface BufferImporterOptions extends ProgressOptions<BufferImportProgressEvents> {
    cidVersion: Version;
    rawLeaves: boolean;
    leafType: 'file' | 'raw';
}
export declare function defaultBufferImporter(options: BufferImporterOptions): BufferImporter;
//# sourceMappingURL=buffer-importer.d.ts.map