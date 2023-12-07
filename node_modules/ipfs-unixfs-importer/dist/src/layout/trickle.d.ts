import type { FileLayout } from '../layout/index.js';
export interface TrickleOptions {
    layerRepeat?: number;
    maxChildrenPerNode?: number;
}
/**
 * @see https://github.com/ipfs/specs/pull/57#issuecomment-265205384
 */
export declare function trickle(options?: TrickleOptions): FileLayout;
//# sourceMappingURL=trickle.d.ts.map