import { ConsumableBuffer } from './consumable-buffer.js';
export declare function wrapHash(hashFn: (value: Uint8Array) => Promise<Uint8Array>): (value: InfiniteHash | Uint8Array) => InfiniteHash;
export declare class InfiniteHash {
    _value: Uint8Array;
    _hashFn: (value: Uint8Array) => Promise<Uint8Array>;
    _depth: number;
    _availableBits: number;
    _currentBufferIndex: number;
    _buffers: ConsumableBuffer[];
    constructor(value: Uint8Array, hashFn: (value: Uint8Array) => Promise<Uint8Array>);
    take(bits: number): Promise<number>;
    untake(bits: number): void;
    _produceMoreBits(): Promise<void>;
}
//# sourceMappingURL=consumable-hash.d.ts.map