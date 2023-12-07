import { ConsumableBuffer } from './consumable-buffer.js'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

export function wrapHash (hashFn: (value: Uint8Array) => Promise<Uint8Array>) {
  function hashing (value: InfiniteHash | Uint8Array) {
    if (value instanceof InfiniteHash) {
      // already a hash. return it
      return value
    } else {
      return new InfiniteHash(value, hashFn)
    }
  }

  return hashing
}

export class InfiniteHash {
  _value: Uint8Array
  _hashFn: (value: Uint8Array) => Promise<Uint8Array>
  _depth: number
  _availableBits: number
  _currentBufferIndex: number
  _buffers: ConsumableBuffer[]

  constructor (value: Uint8Array, hashFn: (value: Uint8Array) => Promise<Uint8Array>) {
    if (!(value instanceof Uint8Array)) {
      throw new Error('can only hash Uint8Arrays')
    }

    this._value = value
    this._hashFn = hashFn
    this._depth = -1
    this._availableBits = 0
    this._currentBufferIndex = 0
    this._buffers = []
  }

  async take (bits: number) {
    let pendingBits = bits

    while (this._availableBits < pendingBits) {
      await this._produceMoreBits()
    }

    let result = 0

    while (pendingBits > 0) {
      const hash = this._buffers[this._currentBufferIndex]
      const available = Math.min(hash.availableBits(), pendingBits)
      const took = hash.take(available)
      result = (result << available) + took
      pendingBits -= available
      this._availableBits -= available

      if (hash.availableBits() === 0) {
        this._currentBufferIndex++
      }
    }

    return result
  }

  untake (bits: number) {
    let pendingBits = bits

    while (pendingBits > 0) {
      const hash = this._buffers[this._currentBufferIndex]
      const availableForUntake = Math.min(hash.totalBits() - hash.availableBits(), pendingBits)
      hash.untake(availableForUntake)
      pendingBits -= availableForUntake
      this._availableBits += availableForUntake

      if (this._currentBufferIndex > 0 && hash.totalBits() === hash.availableBits()) {
        this._depth--
        this._currentBufferIndex--
      }
    }
  }

  async _produceMoreBits () {
    this._depth++

    const value = this._depth > 0 ? uint8ArrayConcat([this._value, Uint8Array.from([this._depth])]) : this._value
    const hashValue = await this._hashFn(value)
    const buffer = new ConsumableBuffer(hashValue)

    this._buffers.push(buffer)
    this._availableBits += buffer.availableBits()
  }
}
