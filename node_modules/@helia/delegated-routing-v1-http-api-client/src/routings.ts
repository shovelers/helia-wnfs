import { type ContentRouting } from '@libp2p/interface/content-routing'
import { CodeError } from '@libp2p/interface/errors'
import { type PeerRouting } from '@libp2p/interface/peer-routing'
import { peerIdFromBytes } from '@libp2p/peer-id'
import { marshal, unmarshal } from 'ipns'
import first from 'it-first'
import map from 'it-map'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { DelegatedRoutingV1HttpApiClient } from './index.js'
import type { AbortOptions } from '@libp2p/interface'
import type { PeerId } from '@libp2p/interface/peer-id'
import type { PeerInfo } from '@libp2p/interface/peer-info'
import type { CID } from 'multiformats/cid'

const IPNS_PREFIX = uint8ArrayFromString('/ipns/')

function isIPNSKey (key: Uint8Array): boolean {
  return uint8ArrayEquals(key.subarray(0, IPNS_PREFIX.byteLength), IPNS_PREFIX)
}

const peerIdFromRoutingKey = (key: Uint8Array): PeerId => {
  return peerIdFromBytes(key.slice(IPNS_PREFIX.length))
}

/**
 * Wrapper class to convert [http-routing-v1 content events](https://specs.ipfs.tech/routing/http-routing-v1/#response-body) into returned values
 */
export class DelegatedRoutingV1HttpApiClientContentRouting implements ContentRouting {
  private readonly client: DelegatedRoutingV1HttpApiClient

  constructor (client: DelegatedRoutingV1HttpApiClient) {
    this.client = client
  }

  async * findProviders (cid: CID, options: AbortOptions = {}): AsyncIterable<PeerInfo> {
    yield * map(this.client.getProviders(cid, options), (record) => {
      return {
        id: record.ID,
        multiaddrs: record.Addrs ?? [],
        protocols: []
      }
    })
  }

  async provide (): Promise<void> {
    // noop
  }

  async put (key: Uint8Array, value: Uint8Array, options?: AbortOptions): Promise<void> {
    if (!isIPNSKey(key)) {
      return
    }

    const peerId = peerIdFromRoutingKey(key)
    const record = unmarshal(value)

    await this.client.putIPNS(peerId, record, options)
  }

  async get (key: Uint8Array, options?: AbortOptions): Promise<Uint8Array> {
    if (!isIPNSKey(key)) {
      throw new CodeError('Not found', 'ERR_NOT_FOUND')
    }

    const peerId = peerIdFromRoutingKey(key)

    try {
      const record = await this.client.getIPNS(peerId, options)

      return marshal(record)
    } catch (err: any) {
      // ERR_BAD_RESPONSE is thrown when the response had no body, which means
      // the record couldn't be found
      if (err.code === 'ERR_BAD_RESPONSE') {
        throw new CodeError('Not found', 'ERR_NOT_FOUND')
      }

      throw err
    }
  }
}

/**
 * Wrapper class to convert [http-routing-v1](https://specs.ipfs.tech/routing/http-routing-v1/#response-body-0) events into expected libp2p values
 */
export class DelegatedRoutingV1HttpApiClientPeerRouting implements PeerRouting {
  private readonly client: DelegatedRoutingV1HttpApiClient

  constructor (client: DelegatedRoutingV1HttpApiClient) {
    this.client = client
  }

  async findPeer (peerId: PeerId, options: AbortOptions = {}): Promise<PeerInfo> {
    const peer = await first(this.client.getPeers(peerId, options))

    if (peer != null) {
      return {
        id: peer.ID,
        multiaddrs: peer.Addrs,
        protocols: []
      }
    }

    throw new CodeError('Not found', 'ERR_NOT_FOUND')
  }

  async * getClosestPeers (key: Uint8Array, options: AbortOptions = {}): AsyncIterable<PeerInfo> {
    // noop
  }
}
