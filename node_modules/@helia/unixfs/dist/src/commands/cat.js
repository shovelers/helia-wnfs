import { exporter } from 'ipfs-unixfs-exporter';
import mergeOpts from 'merge-options';
import { NoContentError, NotAFileError } from '../errors.js';
import { resolve } from './utils/resolve.js';
const mergeOptions = mergeOpts.bind({ ignoreUndefined: true });
const defaultOptions = {};
export async function* cat(cid, blockstore, options = {}) {
    const opts = mergeOptions(defaultOptions, options);
    const resolved = await resolve(cid, opts.path, blockstore, opts);
    const result = await exporter(resolved.cid, blockstore, opts);
    if (result.type !== 'file' && result.type !== 'raw') {
        throw new NotAFileError();
    }
    if (result.content == null) {
        throw new NoContentError();
    }
    yield* result.content(opts);
}
//# sourceMappingURL=cat.js.map