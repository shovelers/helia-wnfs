import { Bucket } from './bucket.js'
import type { BucketOptions, BucketPosition, BucketChild } from './bucket.js'
import { wrapHash } from './consumable-hash.js'

interface UserBucketOptions {
  hashFn: (value: Uint8Array) => Promise<Uint8Array>
  bits?: number
}

export function createHAMT<T> (options: UserBucketOptions) {
  if (options == null || options.hashFn == null) {
    throw new Error('please define an options.hashFn')
  }

  const bucketOptions = {
    bits: options.bits ?? 8,
    hash: wrapHash(options.hashFn)
  }

  return new Bucket<T>(bucketOptions)
}

export { Bucket }
export type { BucketOptions, BucketPosition, BucketChild }
