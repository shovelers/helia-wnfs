import type { Directory, InProgressImportResult, WritableStorage } from '../index.js';
import type { Version } from 'multiformats/cid';
export interface DirBuilderOptions {
    cidVersion: Version;
    signal?: AbortSignal;
}
export declare const dirBuilder: (dir: Directory, blockstore: WritableStorage, options: DirBuilderOptions) => Promise<InProgressImportResult>;
//# sourceMappingURL=dir.d.ts.map