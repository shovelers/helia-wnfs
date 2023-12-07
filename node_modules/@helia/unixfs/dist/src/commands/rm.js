import { logger } from '@libp2p/logger';
import mergeOpts from 'merge-options';
import { InvalidParametersError } from '../errors.js';
import { cidToDirectory } from './utils/cid-to-directory.js';
import { SHARD_SPLIT_THRESHOLD_BYTES } from './utils/constants.js';
import { removeLink } from './utils/remove-link.js';
const mergeOptions = mergeOpts.bind({ ignoreUndefined: true });
const log = logger('helia:unixfs:rm');
const defaultOptions = {
    shardSplitThresholdBytes: SHARD_SPLIT_THRESHOLD_BYTES
};
export async function rm(target, name, blockstore, options = {}) {
    const opts = mergeOptions(defaultOptions, options);
    if (name.includes('/')) {
        throw new InvalidParametersError('Name must not have slashes');
    }
    const directory = await cidToDirectory(target, blockstore, opts);
    log('Removing %s from %c', name, target);
    const result = await removeLink(directory, name, blockstore, {
        ...opts,
        cidVersion: target.version
    });
    return result.cid;
}
//# sourceMappingURL=rm.js.map