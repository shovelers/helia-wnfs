import { BaseBlockstore } from './base.js';
import type { Pair } from 'interface-blockstore';
import type { Await, AwaitIterable } from 'interface-store';
import type { CID } from 'multiformats/cid';
export declare class BlackHoleBlockstore extends BaseBlockstore {
    put(key: CID): Await<CID>;
    get(): Await<Uint8Array>;
    has(): Await<boolean>;
    delete(): Promise<void>;
    getAll(): AwaitIterable<Pair>;
}
//# sourceMappingURL=black-hole.d.ts.map