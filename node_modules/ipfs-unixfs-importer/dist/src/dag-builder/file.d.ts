import type { BufferImporter, File, InProgressImportResult, WritableStorage, ImporterProgressEvents } from '../index.js';
import type { FileLayout } from '../layout/index.js';
import type { CID, Version } from 'multiformats/cid';
import type { ProgressOptions, ProgressEvent } from 'progress-events';
interface BuildFileBatchOptions {
    bufferImporter: BufferImporter;
    blockWriteConcurrency: number;
}
export interface LayoutLeafProgress {
    /**
     * The CID of the leaf being written
     */
    cid: CID;
    /**
     * The path of the file being imported, if one was specified
     */
    path?: string;
}
export type ReducerProgressEvents = ProgressEvent<'unixfs:importer:progress:file:layout', LayoutLeafProgress>;
interface ReduceOptions extends ProgressOptions<ImporterProgressEvents> {
    reduceSingleLeafToSelf: boolean;
    cidVersion: Version;
    signal?: AbortSignal;
}
export interface FileBuilderOptions extends BuildFileBatchOptions, ReduceOptions {
    layout: FileLayout;
}
export declare const fileBuilder: (file: File, block: WritableStorage, options: FileBuilderOptions) => Promise<InProgressImportResult>;
export {};
//# sourceMappingURL=file.d.ts.map