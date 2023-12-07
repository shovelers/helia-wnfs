import * as dagPb from '@ipld/dag-pb';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
export const persist = async (buffer, blockstore, options) => {
    if (options.codec == null) {
        options.codec = dagPb;
    }
    const multihash = await sha256.digest(buffer);
    const cid = CID.create(options.cidVersion, options.codec.code, multihash);
    await blockstore.put(cid, buffer, options);
    return cid;
};
//# sourceMappingURL=persist.js.map