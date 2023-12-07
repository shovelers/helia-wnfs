import { type PBNode } from '@ipld/dag-pb';
import type { ExporterOptions, ShardTraversalContext, ReadableStorage } from '../index.js';
import type { CID } from 'multiformats/cid';
declare const findShardCid: (node: PBNode, name: string, blockstore: ReadableStorage, context?: ShardTraversalContext, options?: ExporterOptions) => Promise<CID | undefined>;
export default findShardCid;
//# sourceMappingURL=find-cid-in-shard.d.ts.map