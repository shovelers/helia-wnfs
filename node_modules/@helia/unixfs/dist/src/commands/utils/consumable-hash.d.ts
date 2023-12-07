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
export declare class ConsumableBuffer {
    _value: Uint8Array;
    _currentBytePos: number;
    _currentBitPos: number;
    constructor(value: Uint8Array);
    availableBits(): number;
    totalBits(): number;
    take(bits: number): number;
    untake(bits: number): void;
    _haveBits(): boolean;
}
//# sourceMappingURL=consumable-hash.d.ts.map