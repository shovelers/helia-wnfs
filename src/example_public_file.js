import { WnfsBlockstore } from './helia_wnfs_blockstore_adaptor.js'
import { CID } from 'multiformats/cid'
import { PublicDirectory } from "wnfs";

export class ExamplePublicFile {
  constructor(node) {
    this.store = new WnfsBlockstore(node)
    this.path = ["public"]
    this.name = "note.txt"

    this.file = this.path.concat(this.name)
  }

  async initalise() {
    const dir = new PublicDirectory(new Date());
    var { rootDir } = await dir.mkdir(this.path, new Date(), this.store);

    this.rootDir = rootDir
    const rootCID = await this.rootDir.store(this.store)
  }

  async loadRootDIR(cid) {
    var rootDir = await PublicDirectory.load(CID.parse(cid).bytes, this.store)
    console.log("loaded root:", rootDir)
    this.rootDir = rootDir
  }

  async write(content) {
    if (this.rootDir == null) {
      await this.initalise()
    }

    var { rootDir } = await this.rootDir.write(
      this.file,
      new TextEncoder().encode(content),
      new Date(),
      this.store
    );
    console.log("root after write", rootDir)

    this.rootDir = rootDir
    return await this.rootDir.store(this.store)
  }

  async read() {
    var content = await this.rootDir.read(this.file, this.store)
    console.log("Files Content:", content);

    return new TextDecoder().decode(content)
  }
}