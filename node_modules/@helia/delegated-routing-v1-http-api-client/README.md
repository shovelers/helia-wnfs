<p align="center">
  <a href="https://github.com/ipfs/helia" title="Helia">
    <img src="https://raw.githubusercontent.com/ipfs/helia/main/assets/helia.png" alt="Helia logo" width="300" />
  </a>
</p>

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/helia-delegated-routing-v1-http-api.svg?style=flat-square)](https://codecov.io/gh/ipfs/helia-delegated-routing-v1-http-api)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/helia-delegated-routing-v1-http-api/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/ipfs/helia-delegated-routing-v1-http-api/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> A Delegated Routing V1 HTTP API client

# About

A client implementation of the IPFS [Delegated Routing V1 HTTP API](https://specs.ipfs.tech/routing/http-routing-v1/) that can be used to interact with any compliant server implementation.

## Example

```typescript
import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { CID } from 'multiformats/cid'

const client = createDelegatedRoutingV1HttpApiClient('https://example.org')

for await (const prov of getProviders(CID.parse('QmFoo'))) {
  // ...
}
```

### How to use with libp2p

The client can be configured as a libp2p service, this will enable it as both a ContentRouting and a PeerRouting implementation

## Example

```typescript
import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'

const client = createDelegatedRoutingV1HttpApiClient('https://example.org')
const libp2p = await createLibp2p({
  // other config here
  services: {
    delegatedRouting: client
  }
})

// later this will use the configured HTTP gateway
await libp2p.peerRouting.findPeer(peerIdFromString('QmFoo'))
```
