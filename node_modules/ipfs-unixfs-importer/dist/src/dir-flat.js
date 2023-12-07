import { encode, prepare } from '@ipld/dag-pb';
import { UnixFS } from 'ipfs-unixfs';
import { Dir, CID_V0, CID_V1 } from './dir.js';
import { persist } from './utils/persist.js';
export class DirFlat extends Dir {
    _children;
    constructor(props, options) {
        super(props, options);
        this._children = new Map();
    }
    async put(name, value) {
        this.cid = undefined;
        this.size = undefined;
        this.nodeSize = undefined;
        this._children.set(name, value);
    }
    async get(name) {
        return Promise.resolve(this._children.get(name));
    }
    childCount() {
        return this._children.size;
    }
    directChildrenCount() {
        return this.childCount();
    }
    onlyChild() {
        return this._children.values().next().value;
    }
    async *eachChildSeries() {
        for (const [key, child] of this._children.entries()) {
            yield {
                key,
                child
            };
        }
    }
    estimateNodeSize() {
        if (this.nodeSize !== undefined) {
            return this.nodeSize;
        }
        this.nodeSize = 0;
        // estimate size only based on DAGLink name and CID byte lengths
        // https://github.com/ipfs/go-unixfsnode/blob/37b47f1f917f1b2f54c207682f38886e49896ef9/data/builder/directory.go#L81-L96
        for (const [name, child] of this._children.entries()) {
            if (child.size != null && (child.cid != null)) {
                this.nodeSize += name.length + (this.options.cidVersion === 1 ? CID_V1.bytes.byteLength : CID_V0.bytes.byteLength);
            }
        }
        return this.nodeSize;
    }
    async *flush(block) {
        const links = [];
        for (const [name, child] of this._children.entries()) {
            let result = child;
            if (child instanceof Dir) {
                for await (const entry of child.flush(block)) {
                    result = entry;
                    yield entry;
                }
            }
            if (result.size != null && (result.cid != null)) {
                links.push({
                    Name: name,
                    Tsize: Number(result.size),
                    Hash: result.cid
                });
            }
        }
        const unixfs = new UnixFS({
            type: 'directory',
            mtime: this.mtime,
            mode: this.mode
        });
        const node = { Data: unixfs.marshal(), Links: links };
        const buffer = encode(prepare(node));
        const cid = await persist(buffer, block, this.options);
        const size = buffer.length + node.Links.reduce(
        /**
         * @param {number} acc
         * @param {PBLink} curr
         */
        (acc, curr) => acc + (curr.Tsize == null ? 0 : curr.Tsize), 0);
        this.cid = cid;
        this.size = size;
        yield {
            cid,
            unixfs,
            path: this.path,
            size: BigInt(size)
        };
    }
}
//# sourceMappingURL=dir-flat.js.map