/*pub trait BlockStore: Sized + CondSync {
  async fn get_block(&self, cid: &Cid) -> Result<Bytes>;
  async fn put_block(&self, bytes: impl Into<Bytes> + CondSend, codec: u64) -> Result<Cid>;

  async fn get_deserializable<V>(&self, cid: &Cid) -> Result<V>
  where
      V: DeserializeOwned,
  {
      let bytes = self.get_block(cid).await?;
      let ipld = decode(bytes.as_ref(), DagCborCodec)?;
      Ok(ipld_serde::from_ipld::<V>(ipld)?)
  }

  async fn put_serializable<V>(&self, value: &V) -> Result<Cid>
  where
      V: Serialize + CondSync,
  {
      let bytes = encode(&ipld_serde::to_ipld(value)?, DagCborCodec)?;
      self.put_block(bytes, CODEC_DAG_CBOR).await
  }

  // This should be the same in all implementations of BlockStore
  fn create_cid(&self, bytes: &[u8], codec: u64) -> Result<Cid> {
      // If there are too many bytes, abandon this task
      if bytes.len() > MAX_BLOCK_SIZE {
          bail!(BlockStoreError::MaximumBlockSizeExceeded(bytes.len()))
      }

      // Compute the Blake3 hash of the bytes
      let hash = Code::Blake3_256.digest(bytes);

      // Represent the hash as a V1 CID
      let cid = Cid::new(Version::V1, codec, hash)?;

      Ok(cid)
  }
}
*/

//need to pass helia blockstore on instatiation and return a blockstore object
import { CID } from 'multiformats/cid'

export class WnfsBlockstore {
  constructor(node) {
    this.helia = node
  }

  async getBlock (cid){
    this.helia.blockstore.get(cid)
  }
  
  async putBlock (bytes, codec){
    throw new Error(`No codec was registered for test`)
    var cid = CID.create(1, bytes, codec)
    this.helia.blockstore.put(cid, bytes)
  }
}

