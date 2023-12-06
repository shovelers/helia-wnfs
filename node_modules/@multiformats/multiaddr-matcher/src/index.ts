/**
 * @packageDocumentation
 *
 * This module exports various matchers that can be used to infer the type of a
 * passed multiaddr.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { DNS } from '@multiformats/multiaddr-matcher'
 *
 * const ma = multiaddr('/dnsaddr/example.org')
 *
 * DNS.matches(ma) // true - this is a multiaddr with a DNS address at the start
 * ```
 *
 * @example
 *
 * The default matching behaviour ignores any subsequent tuples in the multiaddr.
 * If you want stricter matching you can use `.exactMatch`:
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { DNS, Circuit } from '@multiformats/multiaddr-matcher'
 *
 * const ma = multiaddr('/dnsaddr/example.org/p2p/QmFoo/p2p-circuit/p2p/QmBar')
 *
 * DNS.exactMatch(ma) // false - this address has extra tuples after the DNS component
 * Circuit.matches(ma) // true
 * Circuit.exactMatch(ma) // true - the extra tuples are circuit relay related
 * ```
 */

import { isIPv4, isIPv6 } from '@chainsafe/is-ip'
import { type Multiaddr } from '@multiformats/multiaddr'
import { base58btc } from 'multiformats/bases/base58'
import { base64url } from 'multiformats/bases/base64'

/**
 * Split a multiaddr into path components
 */
const toParts = (ma: Multiaddr): string[] => {
  return ma.toString().split('/').slice(1)
}

/**
 * A matcher accepts multiaddr components and either fails to match and returns
 * false or returns a sublist of unmatched components
 */
interface Matcher {
  match(parts: string[]): string[] | false
  pattern: string
}

const func = (fn: (val: string) => boolean): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 1) {
        return false
      }

      if (fn(vals[0])) {
        return vals.slice(1)
      }

      return false
    },
    pattern: 'fn'
  }
}

const literal = (str: string): Matcher => {
  return {
    match: (vals) => func((val) => val === str).match(vals),
    pattern: str
  }
}

const string = (): Matcher => {
  return {
    match: (vals) => func((val) => typeof val === 'string').match(vals),
    pattern: '{string}'
  }
}

const number = (): Matcher => {
  return {
    match: (vals) => func((val) => !isNaN(parseInt(val))).match(vals),
    pattern: '{number}'
  }
}

const peerId = (): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 2) {
        return false
      }

      if (vals[0] !== 'p2p' && vals[0] !== 'ipfs') {
        return false
      }

      // Q is RSA, 1 is Ed25519 or Secp256k1
      if (vals[1].startsWith('Q') || vals[1].startsWith('1')) {
        try {
          base58btc.decode(`z${vals[1]}`)
        } catch (err) {
          return false
        }
      } else {
        return false
      }

      return vals.slice(2)
    },
    pattern: '/p2p/{peerid}'
  }
}

const certhash = (): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 2) {
        return false
      }

      if (vals[0] !== 'certhash') {
        return false
      }

      try {
        base64url.decode(vals[1])
      } catch {
        return false
      }

      return vals.slice(2)
    },
    pattern: '/certhash/{certhash}'
  }
}

const optional = (matcher: Matcher): Matcher => {
  return {
    match: (vals) => {
      const result = matcher.match(vals)

      if (result === false) {
        return vals
      }

      return result
    },
    pattern: `optional(${matcher.pattern})`
  }
}

const or = (...matchers: Matcher[]): Matcher => {
  return {
    match: (vals) => {
      let matches: string[] | undefined

      for (const matcher of matchers) {
        const result = matcher.match(vals)

        // no match
        if (result === false) {
          continue
        }

        // choose greediest matcher
        if (matches == null || result.length < matches.length) {
          matches = result
        }
      }

      if (matches == null) {
        return false
      }

      return matches
    },
    pattern: `or(${matchers.map(m => m.pattern).join(', ')})`
  }
}

const and = (...matchers: Matcher[]): Matcher => {
  return {
    match: (vals) => {
      for (const matcher of matchers) {
        // pass what's left of the array
        const result = matcher.match(vals)

        // no match
        if (result === false) {
          return false
        }

        vals = result
      }

      return vals
    },
    pattern: `and(${matchers.map(m => m.pattern).join(', ')})`
  }
}

function fmt (...matchers: Matcher[]): MultiaddrMatcher {
  function match (ma: Multiaddr): string[] | false {
    let parts = toParts(ma)

    for (const matcher of matchers) {
      const result = matcher.match(parts)

      if (result === false) {
        return false
      }

      parts = result
    }

    return parts
  }

  function matches (ma: Multiaddr): boolean {
    const result = match(ma)

    return result !== false
  }

  function exactMatch (ma: Multiaddr): boolean {
    const result = match(ma)

    if (result === false) {
      return false
    }

    return result.length === 0
  }

  return {
    matches,
    exactMatch
  }
}

/**
 * A MultiaddrMatcher allows interpreting a multiaddr as a certain type of
 * multiaddr
 */
export interface MultiaddrMatcher {
  /**
   * Returns true if the passed multiaddr can be treated as this type of
   * multiaddr
   */
  matches(ma: Multiaddr): boolean

  /**
   * Returns true if the passed multiaddr terminates as this type of
   * multiaddr
   */
  exactMatch(ma: Multiaddr): boolean
}

/**
 * DNS matchers
 */
const _DNS4 = and(literal('dns4'), string())
const _DNS6 = and(literal('dns6'), string())
const _DNSADDR = and(literal('dnsaddr'), string())
const _DNS = and(literal('dns'), string())

/**
 * Matches dns4 addresses.
 *
 * Use {@link DNS DNS} instead to match any type of DNS address.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { DNS4 } from '@multiformats/multiaddr-matcher'
 *
 * DNS4.matches(multiaddr('/dns4/example.org')) // true
 * ```
 */
export const DNS4 = fmt(_DNS4)

/**
 * Matches dns6 addresses.
 *
 * Use {@link DNS DNS} instead to match any type of DNS address.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { DNS6 } from '@multiformats/multiaddr-matcher'
 *
 * DNS6.matches(multiaddr('/dns6/example.org')) // true
 * ```
 */
export const DNS6 = fmt(_DNS6)

/**
 * Matches dnsaddr addresses.
 *
 * Use {@link DNS DNS} instead to match any type of DNS address.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { DNSADDR } from '@multiformats/multiaddr-matcher'
 *
 * DNSADDR.matches(multiaddr('/dnsaddr/example.org')) // true
 * ```
 */
export const DNSADDR = fmt(_DNSADDR)

/**
 * Matches any dns address.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { DNS } from '@multiformats/multiaddr-matcher'
 *
 * DNS.matches(multiaddr('/dnsaddr/example.org')) // true
 * DNS.matches(multiaddr('/dns4/example.org')) // true
 * DNS.matches(multiaddr('/dns6/example.org')) // true
 * ```
 */
export const DNS = fmt(or(
  _DNS,
  _DNSADDR,
  _DNS4,
  _DNS6
))

const _IP4 = and(literal('ip4'), func(isIPv4))
const _IP6 = and(literal('ip6'), func(isIPv6))
const _IP = or(
  _IP4,
  _IP6
)

const _IP_OR_DOMAIN = or(_IP, _DNS, _DNS4, _DNS6, _DNSADDR)

/**
 * A matcher for addresses that start with IP or DNS tuples.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { IP_OR_DOMAIN } from '@multiformats/multiaddr-matcher'
 *
 * IP_OR_DOMAIN.matches(multiaddr('/ip4/123.123.123.123/p2p/QmFoo')) // true
 * IP_OR_DOMAIN.matches(multiaddr('/dns/example.com/p2p/QmFoo')) // true
 * IP_OR_DOMAIN.matches(multiaddr('/p2p/QmFoo')) // false
 * ```
 */
export const IP_OR_DOMAIN = fmt(_IP_OR_DOMAIN)

/**
 * Matches ip4 addresses.
 *
 * Use {@link IP IP} instead to match any ip4/ip6 address.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { IP4 } from '@multiformats/multiaddr-matcher'
 *
 * const ma = multiaddr('/ip4/123.123.123.123')
 *
 * IP4.matches(ma) // true
 * ```
 */
export const IP4 = fmt(_IP4)

/**
 * Matches ip6 addresses.
 *
 * Use {@link IP IP} instead to match any ip4/ip6 address.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { IP6 } from '@multiformats/multiaddr-matcher'
 *
 * const ma = multiaddr('/ip6/fe80::1cc1:a3b8:322f:cf22')
 *
 * IP6.matches(ma) // true
 * ```
 */
export const IP6 = fmt(_IP6)

/**
 * Matches ip4 or ip6 addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { IP } from '@multiformats/multiaddr-matcher'
 *
 * IP.matches(multiaddr('/ip4/123.123.123.123')) // true
 * IP.matches(multiaddr('/ip6/fe80::1cc1:a3b8:322f:cf22')) // true
 * ```
 */
export const IP = fmt(_IP)

const _TCP = and(_IP_OR_DOMAIN, literal('tcp'), number())
const _UDP = and(_IP_OR_DOMAIN, literal('udp'), number())

const TCP_OR_UDP = or(_TCP, _UDP)

/**
 * Matches TCP addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { TCP } from '@multiformats/multiaddr-matcher'
 *
 * TCP.matches(multiaddr('/ip4/123.123.123.123/tcp/1234')) // true
 * ```
 */
export const TCP = fmt(_TCP)

/**
 * Matches UDP addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { UDP } from '@multiformats/multiaddr-matcher'
 *
 * UDP.matches(multiaddr('/ip4/123.123.123.123/udp/1234')) // true
 * ```
 */
export const UDP = fmt(_UDP)

const _QUIC = and(_UDP, literal('quic'))
const _QUICV1 = and(_UDP, literal('quic-v1'))

const QUIC_V0_OR_V1 = or(_QUIC, _QUICV1)

/**
 * Matches QUIC addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { QUIC } from '@multiformats/multiaddr-matcher'
 *
 * QUIC.matches(multiaddr('/ip4/123.123.123.123/udp/1234/quic')) // true
 * ```
 */
export const QUIC = fmt(_QUIC)

/**
 * Matches QUICv1 addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { QUICV1 } from '@multiformats/multiaddr-matcher'
 *
 * QUICV1.matches(multiaddr('/ip4/123.123.123.123/udp/1234/quic-v1')) // true
 * ```
 */
export const QUICV1 = fmt(_QUICV1)

const _WEB = or(
  _IP_OR_DOMAIN,
  _TCP,
  _UDP,
  _QUIC,
  _QUICV1
)

const _WebSockets = or(
  and(_WEB, literal('ws'), optional(peerId()))
)

/**
 * Matches WebSocket addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { WebSockets } from '@multiformats/multiaddr-matcher'
 *
 * WebSockets.matches(multiaddr('/ip4/123.123.123.123/tcp/1234/ws')) // true
 * ```
 */
export const WebSockets = fmt(_WebSockets)

const _WebSocketsSecure = or(
  and(_WEB, literal('wss'), optional(peerId())),
  and(_WEB, literal('tls'), literal('ws'), optional(peerId()))
)

/**
 * Matches secure WebSocket addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { WebSocketsSecure } from '@multiformats/multiaddr-matcher'
 *
 * WebSocketsSecure.matches(multiaddr('/ip4/123.123.123.123/tcp/1234/wss')) // true
 * ```
 */
export const WebSocketsSecure = fmt(_WebSocketsSecure)

const _WebRTCDirect = and(TCP_OR_UDP, literal('webrtc-direct'), certhash(), optional(certhash()), optional(peerId()))

/**
 * Matches WebRTC-direct addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { WebRTCDirect } from '@multiformats/multiaddr-matcher'
 *
 * WebRTCDirect.matches(multiaddr('/ip4/123.123.123.123/tcp/1234/p2p/QmFoo/webrtc-direct/certhash/u....')) // true
 * ```
 */
export const WebRTCDirect = fmt(_WebRTCDirect)

const _WebTransport = and(_QUICV1, literal('webtransport'), certhash(), certhash(), optional(peerId()))

/**
 * Matches WebTransport addresses.
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { WebRTCDirect } from '@multiformats/multiaddr-matcher'
 *
 * WebRTCDirect.matches(multiaddr('/ip4/123.123.123.123/udp/1234/quic-v1/webtransport/certhash/u..../certhash/u..../p2p/QmFoo')) // true
 * ```
 */
export const WebTransport = fmt(_WebTransport)

const _P2P = or(
  _WebSockets,
  _WebSocketsSecure,
  and(_TCP, optional(peerId())),
  and(QUIC_V0_OR_V1, optional(peerId())),
  and(_IP_OR_DOMAIN, optional(peerId())),
  _WebRTCDirect,
  _WebTransport,
  peerId()
)

/**
 * Matches peer addresses
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { P2P } from '@multiformats/multiaddr-matcher'
 *
 * P2P.matches(multiaddr('/ip4/123.123.123.123/tcp/1234/p2p/QmFoo')) // true
 * ```
 */
export const P2P = fmt(_P2P)

const _Circuit = and(_P2P, literal('p2p-circuit'), peerId())

/**
 * Matches circuit relay addresses
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { Circuit } from '@multiformats/multiaddr-matcher'
 *
 * Circuit.matches(multiaddr('/ip4/123.123.123.123/tcp/1234/p2p/QmRelay/p2p-circuit/p2p/QmTarget')) // true
 * ```
 */
export const Circuit = fmt(_Circuit)

const _WebRTC = or(
  and(_P2P, literal('p2p-circuit'), literal('webrtc'), peerId()),
  and(_P2P, literal('webrtc'), optional(peerId())),
  literal('webrtc')
)

/**
 * Matches WebRTC addresses
 *
 * @example
 *
 * ```ts
 * import { multiaddr } from '@multiformats/multiaddr'
 * import { WebRTC } from '@multiformats/multiaddr-matcher'
 *
 * WebRTC.matches(multiaddr('/ip4/123.123.123.123/tcp/1234/p2p/QmRelay/p2p-circuit/webrtc/p2p/QmTarget')) // true
 * ```
 */
export const WebRTC = fmt(_WebRTC)
