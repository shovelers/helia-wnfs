# hamt-sharding <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-hamt-sharding.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-hamt-sharding)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-hamt-sharding/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-hamt-sharding/actions/workflows/js-test-and-release.yml)

> JavaScript implementation of sharding using hash array mapped tries

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Example](#example)
- [API](#api)
  - [`bucket.put(key, value)`](#bucketputkey-value)
  - [`bucket.get(key)`](#bucketgetkey)
  - [`bucket.del(key)`](#bucketdelkey)
  - [`bucket.leafCount()`](#bucketleafcount)
  - [`bucket.childrenCount()`](#bucketchildrencount)
  - [`bucket.onlyChild()`](#bucketonlychild)
  - [`bucket.eachLeafSeries()`](#bucketeachleafseries)
  - [`bucket.serialize(map, reduce)`](#bucketserializemap-reduce)
  - [`bucket.asyncTransform(asyncMap, asyncReduce)`](#bucketasynctransformasyncmap-asyncreduce)
  - [`bucket.toJSON()`](#buckettojson)
  - [`bucket.prettyPrint()`](#bucketprettyprint)
  - [`bucket.tableSize()`](#buckettablesize)
- [Contribute](#contribute)
- [License](#license)
- [Contribute](#contribute-1)

## Install

```console
$ npm i hamt-sharding
```

## Usage

### Example

```javascript
import { createHAMT } from 'hamt-sharding'
import crypto from 'crypto-promise'

// decide how to hash buffers made from keys, can return a Promise
const hashFn = async (buf) => {
  return crypto
    .createHash('sha256')
    .update(buf)
    .digest()
}

const bucket = createHAMT({
  hashFn: hashFn
})

await bucket.put('key', 'value')

const output = await bucket.get('key')
// output === 'value'
```

## API

```javascript
import { createHAMT } from 'hamt-sharding'
```

### `bucket.put(key, value)`

```javascript
import { createHAMT } from 'hamt-sharding'
const bucket = createHAMT({...})

await bucket.put('key', 'value')
```

### `bucket.get(key)`

```javascript
import { createHAMT } from 'hamt-sharding'
const bucket = createHAMT({...})

await bucket.put('key', 'value')

console.info(await bucket.get('key')) // 'value'
```

### `bucket.del(key)`

```javascript
import { createHAMT } from 'hamt-sharding'
const bucket = createHAMT({...})

await bucket.put('key', 'value')
await bucket.del('key', 'value')

console.info(await bucket.get('key')) // undefined
```

### `bucket.leafCount()`

```javascript
import { createHAMT } from 'hamt-sharding'
const bucket = createHAMT({...})

console.info(bucket.leafCount()) // 0

await bucket.put('key', 'value')

console.info(bucket.leafCount()) // 1
```

### `bucket.childrenCount()`

```javascript
import { createHAMT } from 'hamt-sharding'
const bucket = createHAMT({...})

console.info(bucket.childrenCount()) // 0

await bucket.put('key', 'value')

console.info(bucket.childrenCount()) // 234 -- dependent on hashing algorithm
```

### `bucket.onlyChild()`

### `bucket.eachLeafSeries()`

```javascript
import { createHAMT } from 'hamt-sharding'
const bucket = createHAMT({...})

await bucket.put('key', 'value')

for await (const child of bucket.eachLeafSeries()) {
  console.info(child.value) // 'value'
}
```

### `bucket.serialize(map, reduce)`

### `bucket.asyncTransform(asyncMap, asyncReduce)`

### `bucket.toJSON()`

### `bucket.prettyPrint()`

### `bucket.tableSize()`

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs-shipyard/js-hamt-sharding/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-hamt-sharding/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
