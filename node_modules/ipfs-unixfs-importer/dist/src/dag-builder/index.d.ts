import { type DirBuilderOptions } from './dir.js';
import { type FileBuilderOptions } from './file.js';
import type { ChunkValidator } from './validate-chunks.js';
import type { Chunker } from '../chunker/index.js';
import type { ImportCandidate, ImporterProgressEvents, InProgressImportResult, WritableStorage } from '../index.js';
import type { ProgressEvent, ProgressOptions } from 'progress-events';
/**
 * Passed to the onProgress callback while importing files
 */
export interface ImportReadProgress {
    /**
     * How many bytes we have read from this source so far
     */
    bytesRead: bigint;
    /**
     * The size of the current chunk
     */
    chunkSize: bigint;
    /**
     * The path of the file being imported, if one was specified
     */
    path?: string;
}
export type DagBuilderProgressEvents = ProgressEvent<'unixfs:importer:progress:file:read', ImportReadProgress>;
export interface DagBuilderOptions extends FileBuilderOptions, DirBuilderOptions, ProgressOptions<ImporterProgressEvents> {
    chunker: Chunker;
    chunkValidator: ChunkValidator;
    wrapWithDirectory: boolean;
}
export type ImporterSourceStream = AsyncIterable<ImportCandidate> | Iterable<ImportCandidate>;
export interface DAGBuilder {
    (source: ImporterSourceStream, blockstore: WritableStorage): AsyncIterable<() => Promise<InProgressImportResult>>;
}
export declare function defaultDagBuilder(options: DagBuilderOptions): DAGBuilder;
//# sourceMappingURL=index.d.ts.map