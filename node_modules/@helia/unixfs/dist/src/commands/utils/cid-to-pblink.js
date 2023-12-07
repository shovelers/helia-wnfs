import * as dagPb from '@ipld/dag-pb';
import { exporter } from 'ipfs-unixfs-exporter';
import { NotUnixFSError } from '../../errors.js';
export async function cidToPBLink(cid, name, blockstore, options) {
    const sourceEntry = await exporter(cid, blockstore, options);
    if (sourceEntry.type !== 'directory' && sourceEntry.type !== 'file' && sourceEntry.type !== 'raw') {
        throw new NotUnixFSError(`${cid.toString()} was not a UnixFS node`);
    }
    return {
        Name: name,
        Tsize: sourceEntry.node instanceof Uint8Array ? sourceEntry.node.byteLength : dagNodeTsize(sourceEntry.node),
        Hash: cid
    };
}
function dagNodeTsize(node) {
    const linkSizes = node.Links.reduce((acc, curr) => acc + (curr.Tsize ?? 0), 0);
    return dagPb.encode(node).byteLength + linkSizes;
}
//# sourceMappingURL=cid-to-pblink.js.map