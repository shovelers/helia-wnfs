import { base32 } from 'multiformats/bases/base32';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import * as Digest from 'multiformats/hashes/digest';
import { BaseBlockstore } from './base.js';
import * as Errors from './errors.js';
export class MemoryBlockstore extends BaseBlockstore {
    data;
    constructor() {
        super();
        this.data = new Map();
    }
    put(key, val) {
        this.data.set(base32.encode(key.multihash.bytes), val);
        return key;
    }
    get(key) {
        const buf = this.data.get(base32.encode(key.multihash.bytes));
        if (buf == null) {
            throw Errors.notFoundError();
        }
        return buf;
    }
    has(key) {
        return this.data.has(base32.encode(key.multihash.bytes));
    }
    async delete(key) {
        this.data.delete(base32.encode(key.multihash.bytes));
    }
    async *getAll() {
        for (const [key, value] of this.data.entries()) {
            yield {
                cid: CID.createV1(raw.code, Digest.decode(base32.decode(key))),
                block: value
            };
        }
    }
}
//# sourceMappingURL=memory.js.map