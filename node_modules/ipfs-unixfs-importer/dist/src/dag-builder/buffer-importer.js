import * as dagPb from '@ipld/dag-pb';
import { UnixFS } from 'ipfs-unixfs';
import * as raw from 'multiformats/codecs/raw';
import { CustomProgressEvent } from 'progress-events';
import { persist } from '../utils/persist.js';
export function defaultBufferImporter(options) {
    return async function* bufferImporter(file, blockstore) {
        let bytesWritten = 0n;
        for await (let block of file.content) {
            yield async () => {
                let unixfs;
                const opts = {
                    codec: dagPb,
                    cidVersion: options.cidVersion,
                    onProgress: options.onProgress
                };
                if (options.rawLeaves) {
                    opts.codec = raw;
                    opts.cidVersion = 1;
                }
                else {
                    unixfs = new UnixFS({
                        type: options.leafType,
                        data: block
                    });
                    block = dagPb.encode({
                        Data: unixfs.marshal(),
                        Links: []
                    });
                }
                const cid = await persist(block, blockstore, opts);
                bytesWritten += BigInt(block.byteLength);
                options.onProgress?.(new CustomProgressEvent('unixfs:importer:progress:file:write', {
                    bytesWritten,
                    cid,
                    path: file.path
                }));
                return {
                    cid,
                    unixfs,
                    size: BigInt(block.length),
                    block
                };
            };
        }
    };
}
//# sourceMappingURL=buffer-importer.js.map