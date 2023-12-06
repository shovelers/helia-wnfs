import type { Blockstore, Pair } from 'interface-blockstore';
import type { AbortOptions, Await, AwaitIterable } from 'interface-store';
import type { CID } from 'multiformats/cid';
export declare class BaseBlockstore implements Blockstore {
    has(key: CID, options?: AbortOptions): Await<boolean>;
    put(key: CID, val: Uint8Array, options?: AbortOptions): Await<CID>;
    putMany(source: AwaitIterable<Pair>, options?: AbortOptions): AwaitIterable<CID>;
    get(key: CID, options?: AbortOptions): Await<Uint8Array>;
    getMany(source: AwaitIterable<CID>, options?: AbortOptions): AwaitIterable<Pair>;
    delete(key: CID, options?: AbortOptions): Promise<void>;
    deleteMany(source: AwaitIterable<CID>, options?: AbortOptions): AwaitIterable<CID>;
    /**
     * Extending classes should override `query` or implement this method
     */
    getAll(options?: AbortOptions): AwaitIterable<Pair>;
}
//# sourceMappingURL=base.d.ts.map