import { encode, prepare } from '@ipld/dag-pb';
import { UnixFS } from 'ipfs-unixfs';
import { persist } from '../utils/persist.js';
export const dirBuilder = async (dir, blockstore, options) => {
    const unixfs = new UnixFS({
        type: 'directory',
        mtime: dir.mtime,
        mode: dir.mode
    });
    const block = encode(prepare({ Data: unixfs.marshal() }));
    const cid = await persist(block, blockstore, options);
    const path = dir.path;
    return {
        cid,
        path,
        unixfs,
        size: BigInt(block.length),
        originalPath: dir.originalPath,
        block
    };
};
//# sourceMappingURL=dir.js.map