import { BaseBlockstore } from './base.js';
import * as Errors from './errors.js';
export class BlackHoleBlockstore extends BaseBlockstore {
    put(key) {
        return key;
    }
    get() {
        throw Errors.notFoundError();
    }
    has() {
        return false;
    }
    async delete() {
    }
    async *getAll() {
    }
}
//# sourceMappingURL=black-hole.js.map