import { CID } from 'multiformats/cid';
import { BaseBlockstore } from './base.js';
import type { Pair } from 'interface-blockstore';
import type { Await, AwaitIterable } from 'interface-store';
export declare class MemoryBlockstore extends BaseBlockstore {
    private readonly data;
    constructor();
    put(key: CID, val: Uint8Array): Await<CID>;
    get(key: CID): Await<Uint8Array>;
    has(key: CID): Await<boolean>;
    delete(key: CID): Promise<void>;
    getAll(): AwaitIterable<Pair>;
}
//# sourceMappingURL=memory.d.ts.map