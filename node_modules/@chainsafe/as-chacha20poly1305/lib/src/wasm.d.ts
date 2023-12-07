export declare type UpdateFn = (isFirst: boolean, isLast: boolean, chunkLength: number, ciphertextLength: number, asDataLength: number) => void;
export interface WasmContext {
    readonly KEY_LENGTH: number;
    readonly CHACHA20_INPUT_LENGTH: number;
    readonly CHACHA20_COUNTER_LENGTH: number;
    readonly POLY1305_KEY_LENGTH: number;
    readonly POLY1305_INPUT_LENGTH: number;
    readonly POLY1305_OUTPUT_LENGTH: number;
    memory: {
        buffer: ArrayBuffer;
    };
    chacha20Input: {
        value: number;
    };
    chacha20Output: {
        value: number;
    };
    chacha20Key: {
        value: number;
    };
    chacha20Counter: {
        value: number;
    };
    poly1305Input: {
        value: number;
    };
    poly1305Key: {
        value: number;
    };
    poly1305Output: {
        value: number;
    };
    cpKey: {
        value: number;
    };
    cpAssociatedData: {
        value: number;
    };
    cpNonce: {
        value: number;
    };
    cpInput: {
        value: number;
    };
    debug: {
        value: number;
    };
    chacha20StreamXORUpdate(dataLength: number): number;
    poly1305Init(): void;
    poly1305Update(dataLength: number): void;
    poly1305Digest(): void;
    openUpdate: UpdateFn;
    sealUpdate: UpdateFn;
    digest(ciphertextLength: number, asDataLength: number): void;
}
export declare function newInstance(): WasmContext;
//# sourceMappingURL=wasm.d.ts.map