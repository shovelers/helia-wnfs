import { type ContentRouting, contentRouting } from '@libp2p/interface/content-routing'
import { CodeError } from '@libp2p/interface/errors'
import { setMaxListeners } from '@libp2p/interface/events'
import { type PeerRouting, peerRouting } from '@libp2p/interface/peer-routing'
import { logger } from '@libp2p/logger'
import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { anySignal } from 'any-signal'
import toIt from 'browser-readablestream-to-it'
import { unmarshal, type IPNSRecord, marshal, peerIdToRoutingKey } from 'ipns'
import { ipnsValidator } from 'ipns/validator'
import { parse as ndjson } from 'it-ndjson'
import defer from 'p-defer'
import PQueue from 'p-queue'
import { DelegatedRoutingV1HttpApiClientContentRouting, DelegatedRoutingV1HttpApiClientPeerRouting } from './routings.js'
import type { DelegatedRoutingV1HttpApiClient, DelegatedRoutingV1HttpApiClientInit, PeerRecord } from './index.js'
import type { AbortOptions } from '@libp2p/interface'
import type { PeerId } from '@libp2p/interface/peer-id'
import type { CID } from 'multiformats'

const log = logger('delegated-routing-v1-http-api-client')

const defaultValues = {
  concurrentRequests: 4,
  timeout: 30e3
}

export class DefaultDelegatedRoutingV1HttpApiClient implements DelegatedRoutingV1HttpApiClient {
  private started: boolean
  private readonly httpQueue: PQueue
  private readonly shutDownController: AbortController
  private readonly clientUrl: URL
  private readonly timeout: number
  private readonly contentRouting: ContentRouting
  private readonly peerRouting: PeerRouting

  /**
   * Create a new DelegatedContentRouting instance
   */
  constructor (url: string | URL, init: DelegatedRoutingV1HttpApiClientInit = {}) {
    this.started = false
    this.shutDownController = new AbortController()
    setMaxListeners(Infinity, this.shutDownController.signal)
    this.httpQueue = new PQueue({
      concurrency: init.concurrentRequests ?? defaultValues.concurrentRequests
    })
    this.clientUrl = url instanceof URL ? url : new URL(url)
    this.timeout = init.timeout ?? defaultValues.timeout
    this.contentRouting = new DelegatedRoutingV1HttpApiClientContentRouting(this)
    this.peerRouting = new DelegatedRoutingV1HttpApiClientPeerRouting(this)
  }

  get [contentRouting] (): ContentRouting {
    return this.contentRouting
  }

  get [peerRouting] (): PeerRouting {
    return this.peerRouting
  }

  isStarted (): boolean {
    return this.started
  }

  start (): void {
    this.started = true
  }

  stop (): void {
    this.httpQueue.clear()
    this.shutDownController.abort()
    this.started = false
  }

  async * getProviders (cid: CID, options: AbortOptions = {}): AsyncGenerator<PeerRecord, any, unknown> {
    log('getProviders starts: %c', cid)

    const signal = anySignal([this.shutDownController.signal, options.signal, AbortSignal.timeout(this.timeout)])
    const onStart = defer()
    const onFinish = defer()

    void this.httpQueue.add(async () => {
      onStart.resolve()
      return onFinish.promise
    })

    try {
      await onStart.promise

      // https://specs.ipfs.tech/routing/http-routing-v1/
      const resource = `${this.clientUrl}routing/v1/providers/${cid.toString()}`
      const getOptions = { headers: { Accept: 'application/x-ndjson' }, signal }
      const res = await fetch(resource, getOptions)

      if (res.body == null) {
        throw new CodeError('Routing response had no body', 'ERR_BAD_RESPONSE')
      }

      const contentType = res.headers.get('Content-Type')
      if (contentType === 'application/json') {
        const body = await res.json()

        for (const provider of body.Providers) {
          const record = this.#handleProviderRecords(provider)
          if (record != null) {
            yield record
          }
        }
      } else {
        for await (const provider of ndjson(toIt(res.body))) {
          const record = this.#handleProviderRecords(provider)
          if (record != null) {
            yield record
          }
        }
      }
    } catch (err) {
      log.error('getProviders errored:', err)
    } finally {
      signal.clear()
      onFinish.resolve()
      log('getProviders finished: %c', cid)
    }
  }

  async * getPeers (peerId: PeerId, options: AbortOptions | undefined = {}): AsyncGenerator<PeerRecord, any, unknown> {
    log('getPeers starts: %c', peerId)

    const signal = anySignal([this.shutDownController.signal, options.signal, AbortSignal.timeout(this.timeout)])
    const onStart = defer()
    const onFinish = defer()

    void this.httpQueue.add(async () => {
      onStart.resolve()
      return onFinish.promise
    })

    try {
      await onStart.promise

      // https://specs.ipfs.tech/routing/http-routing-v1/
      const resource = `${this.clientUrl}routing/v1/peers/${peerId.toCID().toString()}`
      const getOptions = { headers: { Accept: 'application/x-ndjson' }, signal }
      const res = await fetch(resource, getOptions)

      if (res.body == null) {
        throw new CodeError('Routing response had no body', 'ERR_BAD_RESPONSE')
      }

      const contentType = res.headers.get('Content-Type')
      if (contentType === 'application/json') {
        const body = await res.json()

        for (const peer of body.Peers) {
          const record = this.#handlePeerRecords(peerId, peer)
          if (record != null) {
            yield record
          }
        }
      } else {
        for await (const peer of ndjson(toIt(res.body))) {
          const record = this.#handlePeerRecords(peerId, peer)
          if (record != null) {
            yield record
          }
        }
      }
    } catch (err) {
      log.error('getPeers errored:', err)
    } finally {
      signal.clear()
      onFinish.resolve()
      log('getPeers finished: %c', peerId)
    }
  }

  async getIPNS (peerId: PeerId, options: AbortOptions = {}): Promise<IPNSRecord> {
    log('getIPNS starts: %c', peerId)

    const signal = anySignal([this.shutDownController.signal, options.signal, AbortSignal.timeout(this.timeout)])
    const onStart = defer()
    const onFinish = defer()

    void this.httpQueue.add(async () => {
      onStart.resolve()
      return onFinish.promise
    })

    try {
      await onStart.promise

      // https://specs.ipfs.tech/routing/http-routing-v1/
      const resource = `${this.clientUrl}routing/v1/ipns/${peerId.toCID().toString()}`
      const getOptions = { headers: { Accept: 'application/vnd.ipfs.ipns-record' }, signal }
      const res = await fetch(resource, getOptions)

      if (res.body == null) {
        throw new CodeError('GET ipns response had no body', 'ERR_BAD_RESPONSE')
      }

      const body = new Uint8Array(await res.arrayBuffer())
      await ipnsValidator(peerIdToRoutingKey(peerId), body)
      return unmarshal(body)
    } finally {
      signal.clear()
      onFinish.resolve()
      log('getIPNS finished: %c', peerId)
    }
  }

  async putIPNS (peerId: PeerId, record: IPNSRecord, options: AbortOptions = {}): Promise<void> {
    log('getIPNS starts: %c', peerId)

    const signal = anySignal([this.shutDownController.signal, options.signal, AbortSignal.timeout(this.timeout)])
    const onStart = defer()
    const onFinish = defer()

    void this.httpQueue.add(async () => {
      onStart.resolve()
      return onFinish.promise
    })

    try {
      await onStart.promise

      const body = marshal(record)

      // https://specs.ipfs.tech/routing/http-routing-v1/
      const resource = `${this.clientUrl}routing/v1/ipns/${peerId.toCID().toString()}`
      const getOptions = { method: 'PUT', headers: { 'Content-Type': 'application/vnd.ipfs.ipns-record' }, body, signal }
      const res = await fetch(resource, getOptions)
      if (res.status !== 200) {
        throw new CodeError('PUT ipns response had status other than 200', 'ERR_BAD_RESPONSE')
      }
    } finally {
      signal.clear()
      onFinish.resolve()
      log('getIPNS finished: %c', peerId)
    }
  }

  #handleProviderRecords (record: any): PeerRecord | undefined {
    if (record.Schema === 'peer') {
      // Peer schema can have additional, user-defined, fields.
      record.ID = peerIdFromString(record.ID)
      record.Addrs = record.Addrs.map(multiaddr)
      record.Protocols = record.Protocols ?? []
      return record
    }

    if (record.Schema === 'bitswap') {
      // Bitswap schema is deprecated, was incorrectly used when server had no
      // information about actual protocols, so we convert it to peer result
      // without protocol information
      return {
        Schema: 'peer',
        ID: peerIdFromString(record.ID),
        Addrs: record.Addrs.map(multiaddr),
        Protocols: record.Protocol != null ? [record.Protocol] : []
      }
    }

    if (record.ID != null && Array.isArray(record.Addrs)) {
      return {
        Schema: 'peer',
        ID: peerIdFromString(record.ID),
        Addrs: record.Addrs.map(multiaddr),
        Protocols: Array.isArray(record.Protocols) ? record.Protocols : []
      }
    }
  }

  #handlePeerRecords (peerId: PeerId, record: any): PeerRecord | undefined {
    if (record.Schema === 'peer') {
      // Peer schema can have additional, user-defined, fields.
      record.ID = peerIdFromString(record.ID)
      record.Addrs = record.Addrs.map(multiaddr)
      if (peerId.equals(record.ID)) {
        return record
      }
    }
  }
}
