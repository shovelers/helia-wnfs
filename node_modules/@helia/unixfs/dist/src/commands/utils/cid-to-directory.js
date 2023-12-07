import { exporter } from 'ipfs-unixfs-exporter';
import { NotADirectoryError } from '../../errors.js';
export async function cidToDirectory(cid, blockstore, options = {}) {
    const entry = await exporter(cid, blockstore, options);
    if (entry.type !== 'directory') {
        throw new NotADirectoryError(`${cid.toString()} was not a UnixFS directory`);
    }
    return {
        cid,
        node: entry.node
    };
}
//# sourceMappingURL=cid-to-directory.js.map