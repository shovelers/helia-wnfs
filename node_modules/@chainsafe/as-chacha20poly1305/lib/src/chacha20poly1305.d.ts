import { bytes12, bytes32 } from "./types";
import { WasmContext } from "./wasm";
export declare class ChaCha20Poly1305 {
    private readonly ctx;
    private wasmKeyArr;
    private wasmNonceArr;
    private wasmAdArr;
    private wasmInputArr;
    private wasmChacha20OutputArr;
    private wasmPoly1305OutputArr;
    private wasmDebugArr;
    constructor(ctx: WasmContext);
    /**
     * Encode function
     */
    seal(key: bytes32, nonce: bytes12, plaintext: Uint8Array, associatedData?: Uint8Array, dst?: Uint8Array): Uint8Array;
    /**
     * Decode function
     */
    open(key: bytes32, nonce: bytes12, sealed: Uint8Array, associatedData?: Uint8Array, dst?: Uint8Array): Uint8Array | null;
    private init;
    private openUpdate;
    private sealUpdate;
    private commonUpdate;
    private isSameTag;
}
//# sourceMappingURL=chacha20poly1305.d.ts.map