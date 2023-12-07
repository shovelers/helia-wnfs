import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import { PublicDirectory, PublicFile } from "wnfs";
import { createLibp2p } from 'libp2p'
import { ping } from '@libp2p/ping'
import * as filters from '@libp2p/websockets/filters'
import { WnfsBlockstore } from './helia_wnfs_blockstore_adaptor.js';

const node = await createNode()
const multiaddrs = node.libp2p.getMultiaddrs()
console.log("node address:", multiaddrs);

const wnfsBlockstore = new WnfsBlockstore(node)
const dir = new PublicDirectory(new Date());
var { rootDir } = await dir.mkdir(["pictures"], new Date(), wnfsBlockstore);
//await rootDir.store(wnfsBlockstore);
var { result } = await rootDir.ls(["pictures"], wnfsBlockstore);
console.log("Files in /pictures directory:", result);

var content = new TextEncoder().encode('Hello World 101\n')

const file = new PublicFile(new Date());
const file2 = await file.setContent(new Date(), content, wnfsBlockstore);
const readBack = await file2.readAt(0, undefined, wnfsBlockstore);
console.log("file: ", new TextDecoder().decode(readBack))

var { rootDir } = await rootDir.write(
  ["pictures", "tabby.txt"],
  content,
  new Date(),
  wnfsBlockstore
);
console.log("root after write", rootDir)

await rootDir.store(wnfsBlockstore)

// List all files in /pictures directory.
var { result } = await rootDir.ls(["pictures"], wnfsBlockstore);

console.log("Files in /pictures directory:", result);

async function createNode () {
  // the blockstore is where we store the blocks that make up files
  const blockstore = new MemoryBlockstore()

  // application-specific data lives in the datastore
  const datastore = new MemoryDatastore()

  // libp2p is the networking layer that underpins Helia
  const libp2p = await createLibp2p({
    datastore,
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0/ws']
    },
    transports: [webSockets({filter: filters.all})],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: async (multiAddr) => {
        const str = multiAddr.toString()
        return !str.includes("/ws/") && !str.includes("/wss/") && !str.includes("/webtransport/")
      },
    },
    services: {
      ping: ping({
        maxInboundStreams: 100,
        maxOutboundStreams: 100,
        runOnTransientConnection: false,
      }),
    },
  })
  
  
  return await createHelia({
    datastore,
    blockstore,
    libp2p
  })
}