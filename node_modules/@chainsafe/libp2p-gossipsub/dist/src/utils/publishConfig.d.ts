import { StrictSign, StrictNoSign } from '@libp2p/interface/pubsub';
import { type PublishConfig } from '../types.js';
import type { PeerId } from '@libp2p/interface/peer-id';
/**
 * Prepare a PublishConfig object from a PeerId.
 */
export declare function getPublishConfigFromPeerId(signaturePolicy: typeof StrictSign | typeof StrictNoSign, peerId?: PeerId): Promise<PublishConfig>;
//# sourceMappingURL=publishConfig.d.ts.map