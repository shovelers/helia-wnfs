"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Poly1305 = void 0;
const const_1 = require("../common/const");
class Poly1305 {
    constructor(ctx) {
        this.ctx = ctx;
        const wasmPoly1305KeyValue = ctx.poly1305Key.value;
        this.wasmKeyArr = new Uint8Array(ctx.memory.buffer, wasmPoly1305KeyValue, const_1.KEY_LENGTH);
        const wasmPoly1305InputValue = ctx.poly1305Input.value;
        this.wasmInputArr = new Uint8Array(ctx.memory.buffer, wasmPoly1305InputValue, const_1.DATA_CHUNK_LENGTH);
        const wasmPoly1305OutputValue = ctx.poly1305Output.value;
        this.wasmOutputArr = new Uint8Array(ctx.memory.buffer, wasmPoly1305OutputValue, const_1.TAG_LENGTH);
        const wasmPoly1305DebugValue = ctx.debug.value;
        this.wasmDebugArr = new Uint32Array(ctx.memory.buffer, wasmPoly1305DebugValue, 64);
    }
    init(key) {
        if (key.length != const_1.KEY_LENGTH) {
            throw Error(`Invalid poly1305 key length ${key.length}, expect ${const_1.KEY_LENGTH}`);
        }
        this.wasmKeyArr.set(key);
        this.ctx.poly1305Init();
    }
    update(data) {
        if (data.length <= const_1.DATA_CHUNK_LENGTH) {
            this.wasmInputArr.set(data);
            this.ctx.poly1305Update(data.length);
            return;
        }
        for (let offset = 0; offset < data.length; offset += const_1.DATA_CHUNK_LENGTH) {
            const end = Math.min(data.length, offset + const_1.DATA_CHUNK_LENGTH);
            this.wasmInputArr.set(data.subarray(offset, end));
            this.ctx.poly1305Update(end - offset);
        }
    }
    digest() {
        this.ctx.poly1305Digest();
        const out = new Uint8Array(const_1.TAG_LENGTH);
        out.set(this.wasmOutputArr);
        return out;
    }
}
exports.Poly1305 = Poly1305;
//# sourceMappingURL=poly1305.js.map