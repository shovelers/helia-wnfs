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
//# sourceMappingURL=consumable-buffer.d.ts.map