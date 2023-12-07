import { encode, prepare } from '@ipld/dag-pb';
import { createHAMT, Bucket } from 'hamt-sharding';
import { UnixFS } from 'ipfs-unixfs';
import { CID } from 'multiformats/cid';
import { hamtHashCode, hamtHashFn } from './hamt-constants.js';
import { persist } from './persist.js';
class Dir {
    options;
    root;
    dir;
    path;
    dirty;
    flat;
    parent;
    parentKey;
    unixfs;
    mode;
    mtime;
    cid;
    size;
    nodeSize;
    constructor(props, options) {
        this.options = options ?? {};
        this.root = props.root;
        this.dir = props.dir;
        this.path = props.path;
        this.dirty = props.dirty;
        this.flat = props.flat;
        this.parent = props.parent;
        this.parentKey = props.parentKey;
        this.unixfs = props.unixfs;
        this.mode = props.mode;
        this.mtime = props.mtime;
    }
}
export class DirSharded extends Dir {
    _bucket;
    constructor(props, options) {
        super(props, options);
        this._bucket = createHAMT({
            hashFn: hamtHashFn,
            bits: 8
        });
    }
    async put(name, value) {
        this.cid = undefined;
        this.size = undefined;
        this.nodeSize = undefined;
        await this._bucket.put(name, value);
    }
    async get(name) {
        return this._bucket.get(name);
    }
    childCount() {
        return this._bucket.leafCount();
    }
    directChildrenCount() {
        return this._bucket.childrenCount();
    }
    onlyChild() {
        return this._bucket.onlyChild();
    }
    async *eachChildSeries() {
        for await (const { key, value } of this._bucket.eachLeafSeries()) {
            yield {
                key,
                child: value
            };
        }
    }
    estimateNodeSize() {
        if (this.nodeSize !== undefined) {
            return this.nodeSize;
        }
        this.nodeSize = calculateSize(this._bucket, this, this.options);
        return this.nodeSize;
    }
    async *flush(blockstore) {
        for await (const entry of flush(this._bucket, blockstore, this, this.options)) {
            yield {
                ...entry,
                path: this.path
            };
        }
    }
}
async function* flush(bucket, blockstore, shardRoot, options) {
    const children = bucket._children;
    const links = [];
    let childrenSize = 0n;
    for (let i = 0; i < children.length; i++) {
        const child = children.get(i);
        if (child == null) {
            continue;
        }
        const labelPrefix = i.toString(16).toUpperCase().padStart(2, '0');
        if (child instanceof Bucket) {
            let shard;
            for await (const subShard of flush(child, blockstore, null, options)) {
                shard = subShard;
            }
            if (shard == null) {
                throw new Error('Could not flush sharded directory, no subshard found');
            }
            links.push({
                Name: labelPrefix,
                Tsize: Number(shard.size),
                Hash: shard.cid
            });
            childrenSize += shard.size;
        }
        else if (isDir(child.value)) {
            const dir = child.value;
            let flushedDir;
            for await (const entry of dir.flush(blockstore)) {
                flushedDir = entry;
                yield flushedDir;
            }
            if (flushedDir == null) {
                throw new Error('Did not flush dir');
            }
            const label = labelPrefix + child.key;
            links.push({
                Name: label,
                Tsize: Number(flushedDir.size),
                Hash: flushedDir.cid
            });
            childrenSize += flushedDir.size;
        }
        else {
            const value = child.value;
            if (value.cid == null) {
                continue;
            }
            const label = labelPrefix + child.key;
            const size = value.size;
            links.push({
                Name: label,
                Tsize: Number(size),
                Hash: value.cid
            });
            childrenSize += BigInt(size ?? 0);
        }
    }
    // go-ipfs uses little endian, that's why we have to
    // reverse the bit field before storing it
    const data = Uint8Array.from(children.bitField().reverse());
    const dir = new UnixFS({
        type: 'hamt-sharded-directory',
        data,
        fanout: BigInt(bucket.tableSize()),
        hashType: hamtHashCode,
        mtime: shardRoot?.mtime,
        mode: shardRoot?.mode
    });
    const node = {
        Data: dir.marshal(),
        Links: links
    };
    const buffer = encode(prepare(node));
    const cid = await persist(buffer, blockstore, options);
    const size = BigInt(buffer.byteLength) + childrenSize;
    yield {
        cid,
        unixfs: dir,
        size
    };
}
function isDir(obj) {
    return typeof obj.flush === 'function';
}
function calculateSize(bucket, shardRoot, options) {
    const children = bucket._children;
    const links = [];
    for (let i = 0; i < children.length; i++) {
        const child = children.get(i);
        if (child == null) {
            continue;
        }
        const labelPrefix = i.toString(16).toUpperCase().padStart(2, '0');
        if (child instanceof Bucket) {
            const size = calculateSize(child, null, options);
            links.push({
                Name: labelPrefix,
                Tsize: Number(size),
                Hash: options.cidVersion === 0 ? CID_V0 : CID_V1
            });
        }
        else if (typeof child.value.flush === 'function') {
            const dir = child.value;
            const size = dir.nodeSize();
            links.push({
                Name: labelPrefix + child.key,
                Tsize: Number(size),
                Hash: options.cidVersion === 0 ? CID_V0 : CID_V1
            });
        }
        else {
            const value = child.value;
            if (value.cid == null) {
                continue;
            }
            const label = labelPrefix + child.key;
            const size = value.size;
            links.push({
                Name: label,
                Tsize: Number(size),
                Hash: value.cid
            });
        }
    }
    // go-ipfs uses little endian, that's why we have to
    // reverse the bit field before storing it
    const data = Uint8Array.from(children.bitField().reverse());
    const dir = new UnixFS({
        type: 'hamt-sharded-directory',
        data,
        fanout: BigInt(bucket.tableSize()),
        hashType: hamtHashCode,
        mtime: shardRoot?.mtime,
        mode: shardRoot?.mode
    });
    const buffer = encode(prepare({
        Data: dir.marshal(),
        Links: links
    }));
    return buffer.length;
}
// we use these to calculate the node size to use as a check for whether a directory
// should be sharded or not. Since CIDs have a constant length and We're only
// interested in the data length and not the actual content identifier we can use
// any old CID instead of having to hash the data which is expensive.
export const CID_V0 = CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn');
export const CID_V1 = CID.parse('zdj7WbTaiJT1fgatdet9Ei9iDB5hdCxkbVyhyh8YTUnXMiwYi');
//# sourceMappingURL=dir-sharded.js.map