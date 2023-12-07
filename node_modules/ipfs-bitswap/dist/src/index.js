import { DefaultBitswap } from './bitswap.js';
export const createBitswap = (libp2p, blockstore, options = {}) => {
    return new DefaultBitswap(libp2p, blockstore, options);
};
//# sourceMappingURL=index.js.map