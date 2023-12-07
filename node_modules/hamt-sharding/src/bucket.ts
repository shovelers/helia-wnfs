// @ts-expect-error
import SparseArray from 'sparse-array'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { InfiniteHash } from './consumable-hash.js'

export interface BucketChild<V> {
  key: string
  value: V
  hash: InfiniteHash
}

interface SA<B> {
  length: number
  compactArray: () => B[]
  get: (i: number) => B
  set: (i: number, value: B) => void
  reduce: <A> (fn: (acc: A, curr: B, index: number) => A, initial: A) => B
  find: (fn: (item: B) => boolean) => B | undefined
  bitField: () => number[]
  unset: (i: number) => void
}

export interface BucketPosition<T> {
  bucket: Bucket<T>
  pos: number
  hash: InfiniteHash
  existingChild?: BucketChild<T>
}

export interface BucketOptions {
  bits: number
  hash: (value: Uint8Array | InfiniteHash) => InfiniteHash
}

export class Bucket<T> {
  _options: BucketOptions
  _popCount: number
  _parent?: Bucket<T>
  _posAtParent: number
  _children: SA<Bucket<T> | BucketChild<T>>

  key: string | null

  constructor (options: BucketOptions, parent?: Bucket<T>, posAtParent = 0) {
    this._options = options
    this._popCount = 0
    this._parent = parent
    this._posAtParent = posAtParent
    this._children = new SparseArray()
    this.key = null
  }

  async put (key: string, value: T) {
    const place = await this._findNewBucketAndPos(key)

    await place.bucket._putAt(place, key, value)
  }

  async get (key: string) {
    const child = await this._findChild(key)

    if (child != null) {
      return child.value
    }
  }

  async del (key: string) {
    const place = await this._findPlace(key)
    const child = place.bucket._at(place.pos)

    if (child != null && child.key === key) {
      place.bucket._delAt(place.pos)
    }
  }

  leafCount (): number {
    const children = this._children.compactArray()

    return children.reduce((acc, child) => {
      if (child instanceof Bucket) {
        return acc + child.leafCount()
      }

      return acc + 1
    }, 0)
  }

  childrenCount () {
    return this._children.length
  }

  onlyChild () {
    return this._children.get(0)
  }

  * eachLeafSeries (): Iterable<BucketChild<T>> {
    const children = this._children.compactArray()

    for (const child of children) {
      if (child instanceof Bucket) {
        yield * child.eachLeafSeries()
      } else {
        yield child
      }
    }
  }

  serialize (map: (value: BucketChild<T>, index: number) => T, reduce: (reduced: any) => any) {
    const acc: T[] = []
    // serialize to a custom non-sparse representation
    return reduce(this._children.reduce((acc, child, index) => {
      if (child != null) {
        if (child instanceof Bucket) {
          acc.push(child.serialize(map, reduce))
        } else {
          acc.push(map(child, index))
        }
      }
      return acc
    }, acc))
  }

  async asyncTransform (asyncMap: (value: BucketChild<T>) => Promise<T[]>, asyncReduce: (reduced: any) => Promise<any>) {
    return await asyncTransformBucket(this, asyncMap, asyncReduce)
  }

  toJSON () {
    return this.serialize(mapNode, reduceNodes)
  }

  prettyPrint () {
    return JSON.stringify(this.toJSON(), null, '  ')
  }

  tableSize () {
    return Math.pow(2, this._options.bits)
  }

  async _findChild (key: string) {
    const result = await this._findPlace(key)
    const child = result.bucket._at(result.pos)

    if (child instanceof Bucket) {
      // should not be possible, this._findPlace should always
      // return a location for a child, not a bucket
      return undefined
    }

    if (child != null && child.key === key) {
      return child
    }
  }

  async _findPlace (key: string | InfiniteHash): Promise<BucketPosition<T>> {
    const hashValue = this._options.hash(typeof key === 'string' ? uint8ArrayFromString(key) : key)
    const index = await hashValue.take(this._options.bits)

    const child = this._children.get(index)

    if (child instanceof Bucket) {
      return await child._findPlace(hashValue)
    }

    return {
      bucket: this,
      pos: index,
      hash: hashValue,
      existingChild: child
    }
  }

  async _findNewBucketAndPos (key: string | InfiniteHash): Promise<BucketPosition<T>> {
    const place = await this._findPlace(key)

    if ((place.existingChild != null) && place.existingChild.key !== key) {
      // conflict
      const bucket = new Bucket(this._options, place.bucket, place.pos)
      place.bucket._putObjectAt(place.pos, bucket)

      // put the previous value
      const newPlace = await bucket._findPlace(place.existingChild.hash)
      newPlace.bucket._putAt(newPlace, place.existingChild.key, place.existingChild.value)

      return await bucket._findNewBucketAndPos(place.hash)
    }

    // no conflict, we found the place
    return place
  }

  _putAt (place: BucketPosition<T>, key: string, value: T) {
    this._putObjectAt(place.pos, {
      key: key,
      value: value,
      hash: place.hash
    })
  }

  _putObjectAt (pos: number, object: Bucket<T> | BucketChild<T>) {
    if (this._children.get(pos) == null) {
      this._popCount++
    }
    this._children.set(pos, object)
  }

  _delAt (pos: number) {
    if (pos === -1) {
      throw new Error('Invalid position')
    }

    if (this._children.get(pos) != null) {
      this._popCount--
    }
    this._children.unset(pos)
    this._level()
  }

  _level () {
    if (this._parent != null && this._popCount <= 1) {
      if (this._popCount === 1) {
        // remove myself from parent, replacing me with my only child
        const onlyChild = this._children.find(exists)

        if ((onlyChild != null) && !(onlyChild instanceof Bucket)) {
          const hash = onlyChild.hash
          hash.untake(this._options.bits)
          const place = {
            pos: this._posAtParent,
            hash: hash,
            bucket: this._parent
          }
          this._parent._putAt(place, onlyChild.key, onlyChild.value)
        }
      } else {
        this._parent._delAt(this._posAtParent)
      }
    }
  }

  _at (index: number) {
    return this._children.get(index)
  }
}

function exists (o: any) {
  return Boolean(o)
}

function mapNode (node: any, _: number) {
  return node.key
}

function reduceNodes (nodes: any) {
  return nodes
}

async function asyncTransformBucket<T> (bucket: Bucket<T>, asyncMap: (value: BucketChild<T>) => Promise<T[]>, asyncReduce: (reduced: any) => Promise<any>) {
  const output = []

  for (const child of bucket._children.compactArray()) {
    if (child instanceof Bucket) {
      await asyncTransformBucket(child, asyncMap, asyncReduce)
    } else {
      const mappedChildren = await asyncMap(child)

      output.push({
        bitField: bucket._children.bitField(),
        children: mappedChildren
      })
    }
  }

  return await asyncReduce(output)
}
