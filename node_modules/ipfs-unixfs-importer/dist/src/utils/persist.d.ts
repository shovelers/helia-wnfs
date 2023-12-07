import { CID } from 'multiformats/cid';
import type { WritableStorage } from '../index.js';
import type { Version as CIDVersion } from 'multiformats/cid';
import type { BlockCodec } from 'multiformats/codecs/interface';
import type { ProgressOptions } from 'progress-events';
export interface PersistOptions extends ProgressOptions {
    codec?: BlockCodec<any, any>;
    cidVersion: CIDVersion;
    signal?: AbortSignal;
}
export declare const persist: (buffer: Uint8Array, blockstore: WritableStorage, options: PersistOptions) => Promise<CID>;
//# sourceMappingURL=persist.d.ts.map