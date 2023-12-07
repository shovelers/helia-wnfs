import { bytes16, bytes32 } from "./types";
/**
 * chacha 20 function.
 * @param key a 32 byte Uint8Array
 * @param nonce a 16 byte Uint8Array
 * @param src
 * @returns
 */
export declare function chacha20StreamXOR(key: bytes32, nonce: bytes16, src: Uint8Array): Uint8Array;
//# sourceMappingURL=chacha20.d.ts.map