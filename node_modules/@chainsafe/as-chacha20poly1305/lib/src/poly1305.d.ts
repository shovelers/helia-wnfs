import { WasmContext } from "./wasm";
export declare class Poly1305 {
    private readonly ctx;
    private wasmKeyArr;
    private wasmInputArr;
    private wasmOutputArr;
    private wasmDebugArr;
    constructor(ctx: WasmContext);
    init(key: Uint8Array): void;
    update(data: Uint8Array): void;
    digest(): Uint8Array;
}
//# sourceMappingURL=poly1305.d.ts.map