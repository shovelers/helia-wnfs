/**
 * @packageDocumentation
 *
 * @example
 *
 * ```js
 *
 * import { pipe } from 'it-pipe'
 * import { duplexPair } from 'it-pair/duplex'
 * import { handshake } from 'it-handshake'
 *
 * // Create connected duplex streams
 * const [client, server] = duplexPair()
 * const clientShake = handshake(client)
 * const serverShake = handshake(server)
 *
 * clientShake.write('hello')
 * console.log('client: %s', await serverShake.read())
 * // > client: hello
 * serverShake.write('hi')
 * serverShake.rest() // the server has finished the handshake
 * console.log('server: %s', await clientShake.read())
 * // > server: hi
 * clientShake.rest() // the client has finished the handshake
 *
 * // Make the server echo responses
 * pipe(
 *   serverShake.stream,
 *   async function * (source) {
 *     for await (const message of source) {
 *       yield message
 *     }
 *   },
 *   serverShake.stream
 * )
 *
 * // Send and receive an echo through the handshake stream
 * pipe(
 *   ['echo'],
 *   clientShake.stream,
 *   async function * (source) {
 *     for await (const bufferList of source) {
 *       console.log('Echo response: %s', bufferList.slice())
 *       // > Echo response: echo
 *     }
 *   }
 * )
 * ```
 */

import { Reader, reader } from 'it-reader'
import { pushable } from 'it-pushable'
import defer from 'p-defer'
import type { Duplex, Source } from 'it-stream-types'
import type { Pushable } from 'it-pushable'
import type { Uint8ArrayList } from 'uint8arraylist'

export interface Handshake<TSink = Uint8Array | Uint8ArrayList> {
  reader: Reader
  writer: Pushable<TSink>
  stream: Duplex<AsyncGenerator<Uint8ArrayList | Uint8Array>, Source<TSink>, Promise<void>>
  rest: () => Source<TSink>
  write: (data: TSink) => void
  read: () => Promise<Uint8ArrayList | undefined>
}

// Convert a duplex stream into a reader and writer and rest stream
export function handshake<TSink extends Uint8ArrayList | Uint8Array = Uint8ArrayList> (stream: Duplex<AsyncIterable<Uint8ArrayList | Uint8Array>, Source<TSink>, Promise<void>>): Handshake<TSink> {
  const writer = pushable<TSink>() // Write bytes on demand to the sink
  const source = reader(stream.source) // Read bytes on demand from the source

  // Waits for a source to be passed to the rest stream's sink
  const sourcePromise = defer<Source<TSink>>()
  let sinkErr: Error

  const sinkPromise = stream.sink((async function * () {
    yield * writer
    const source = await sourcePromise.promise
    yield * source
  })())

  sinkPromise.catch(err => {
    sinkErr = err
  })

  const rest: Duplex<AsyncGenerator<Uint8ArrayList>, Source<TSink>, Promise<void>> = {
    sink: async source => {
      if (sinkErr != null) {
        await Promise.reject(sinkErr); return
      }

      sourcePromise.resolve(source)
      await sinkPromise
    },
    source
  }

  return {
    reader: source,
    writer,
    stream: rest,
    rest: () => writer.end(),
    write: writer.push,
    read: async () => {
      const res = await source.next()

      if (res.value != null) {
        return res.value
      }
    }
  }
}
