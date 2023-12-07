"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaCha20Poly1305 = void 0;
const const_1 = require("../common/const");
class ChaCha20Poly1305 {
    constructor(ctx) {
        this.ctx = ctx;
        const wasmKeyValue = ctx.cpKey.value;
        this.wasmKeyArr = new Uint8Array(ctx.memory.buffer, wasmKeyValue, const_1.KEY_LENGTH);
        const wasmNonceValue = ctx.cpNonce.value;
        this.wasmNonceArr = new Uint8Array(ctx.memory.buffer, wasmNonceValue, const_1.NONCE_LENGTH);
        const wasmAdValue = ctx.cpAssociatedData.value;
        // 32, same to KEY_LENGTH
        this.wasmAdArr = new Uint8Array(ctx.memory.buffer, wasmAdValue, const_1.KEY_LENGTH);
        const wasmSealedValue = ctx.cpInput.value;
        this.wasmInputArr = new Uint8Array(ctx.memory.buffer, wasmSealedValue, const_1.DATA_CHUNK_LENGTH);
        const wasmChacha20OutputValue = ctx.chacha20Output.value;
        this.wasmChacha20OutputArr = new Uint8Array(ctx.memory.buffer, wasmChacha20OutputValue, const_1.DATA_CHUNK_LENGTH);
        const wasmPoly1305OutputValue = ctx.poly1305Output.value;
        this.wasmPoly1305OutputArr = new Uint8Array(ctx.memory.buffer, wasmPoly1305OutputValue, const_1.TAG_LENGTH);
        const wasmDebugValue = ctx.debug.value;
        this.wasmDebugArr = new Uint32Array(ctx.memory.buffer, wasmDebugValue, 64);
    }
    /**
     * Encode function
     */
    seal(key, nonce, plaintext, associatedData, dst) {
        this.init(key, nonce, associatedData);
        const resultLength = plaintext.length + const_1.TAG_LENGTH;
        let result;
        if (dst) {
            if (dst.length !== resultLength) {
                throw new Error("ChaCha20Poly1305: incorrect destination length");
            }
            result = dst;
        }
        else {
            result = new Uint8Array(resultLength);
        }
        const asDataLength = associatedData?.length ?? 0;
        this.sealUpdate(plaintext, asDataLength, result);
        // wasmPoly1305OutputArr was updated after the last update() call
        result.set(this.wasmPoly1305OutputArr, plaintext.length);
        return result;
    }
    /**
     * Decode function
     */
    open(key, nonce, sealed, associatedData, dst) {
        this.init(key, nonce, associatedData);
        const sealedNoTag = sealed.subarray(0, sealed.length - const_1.TAG_LENGTH);
        let result;
        if (dst) {
            if (dst.length !== sealedNoTag.length) {
                throw new Error("ChaCha20Poly1305: incorrect destination length");
            }
            result = dst;
        }
        else {
            result = new Uint8Array(sealedNoTag.length);
        }
        const asDataLength = associatedData?.length ?? 0;
        this.openUpdate(sealedNoTag, asDataLength, result);
        const tag = sealed.subarray(sealed.length - const_1.TAG_LENGTH, sealed.length);
        // wasmPoly1305OutputArr was updated after the last update() call
        const isTagValid = this.isSameTag(tag);
        return isTagValid ? result : null;
    }
    init(key, nonce, ad = new Uint8Array(0)) {
        if (key.length != const_1.KEY_LENGTH) {
            throw Error(`Invalid chacha20poly1305 key length ${key.length}, expect ${const_1.KEY_LENGTH}`);
        }
        if (ad.length > const_1.KEY_LENGTH) {
            throw Error(`Invalid ad length ${ad.length}, expect <= ${const_1.KEY_LENGTH}`);
        }
        if (nonce.length !== const_1.NONCE_LENGTH) {
            throw Error(`Invalid nonce length ${nonce.length}, expect ${const_1.NONCE_LENGTH}`);
        }
        this.wasmKeyArr.set(key);
        this.wasmNonceArr.set(nonce);
        this.wasmAdArr.set(ad);
        // don't do the wasm init here, do it in the first openUpdate() or sealUpdate() to save one call
    }
    openUpdate(data, asDataLength, dst) {
        this.commonUpdate(data, this.ctx.openUpdate, asDataLength, dst);
    }
    sealUpdate(data, asDataLength, dst) {
        this.commonUpdate(data, this.ctx.sealUpdate, asDataLength, dst);
    }
    commonUpdate(data, updateFn, asDataLength, dst) {
        const length = data.length;
        if (data.length <= const_1.DATA_CHUNK_LENGTH) {
            this.wasmInputArr.set(data);
            updateFn(true, true, length, length, asDataLength);
            dst.set(length === const_1.DATA_CHUNK_LENGTH ? this.wasmChacha20OutputArr : this.wasmChacha20OutputArr.subarray(0, length));
            return;
        }
        for (let offset = 0; offset < length; offset += const_1.DATA_CHUNK_LENGTH) {
            const end = Math.min(length, offset + const_1.DATA_CHUNK_LENGTH);
            this.wasmInputArr.set(data.subarray(offset, end));
            const isFirst = offset === 0;
            const isLast = offset + const_1.DATA_CHUNK_LENGTH >= length;
            updateFn(isFirst, isLast, end - offset, length, asDataLength);
            dst.set(end - offset === const_1.DATA_CHUNK_LENGTH
                ? this.wasmChacha20OutputArr
                : this.wasmChacha20OutputArr.subarray(0, end - offset), offset);
        }
    }
    isSameTag(tag) {
        // wasmPoly1305OutputArr is updated after the last digest() call
        let isSameTag = true;
        for (let i = 0; i < const_1.TAG_LENGTH; i++) {
            if (this.wasmPoly1305OutputArr[i] !== tag[i]) {
                isSameTag = false;
                break;
            }
        }
        return isSameTag;
    }
}
exports.ChaCha20Poly1305 = ChaCha20Poly1305;
//# sourceMappingURL=chacha20poly1305.js.map