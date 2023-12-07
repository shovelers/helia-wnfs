import { CID } from 'multiformats/cid';
export class Dir {
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
// we use these to calculate the node size to use as a check for whether a directory
// should be sharded or not. Since CIDs have a constant length and We're only
// interested in the data length and not the actual content identifier we can use
// any old CID instead of having to hash the data which is expensive.
export const CID_V0 = CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn');
export const CID_V1 = CID.parse('zdj7WbTaiJT1fgatdet9Ei9iDB5hdCxkbVyhyh8YTUnXMiwYi');
//# sourceMappingURL=dir.js.map