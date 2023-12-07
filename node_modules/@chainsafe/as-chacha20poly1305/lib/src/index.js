"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newInstance = exports.chacha20StreamXOR = exports.Poly1305 = exports.ChaCha20Poly1305 = void 0;
var chacha20poly1305_1 = require("./chacha20poly1305");
Object.defineProperty(exports, "ChaCha20Poly1305", { enumerable: true, get: function () { return chacha20poly1305_1.ChaCha20Poly1305; } });
var poly1305_1 = require("./poly1305");
Object.defineProperty(exports, "Poly1305", { enumerable: true, get: function () { return poly1305_1.Poly1305; } });
var chacha20_1 = require("./chacha20");
Object.defineProperty(exports, "chacha20StreamXOR", { enumerable: true, get: function () { return chacha20_1.chacha20StreamXOR; } });
var wasm_1 = require("./wasm");
Object.defineProperty(exports, "newInstance", { enumerable: true, get: function () { return wasm_1.newInstance; } });
//# sourceMappingURL=index.js.map