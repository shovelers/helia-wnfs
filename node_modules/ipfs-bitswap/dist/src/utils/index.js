import { logger as createLogger } from '@libp2p/logger';
import { equals as uint8ArrayEquals } from 'uint8arrays/equals';
import { BitswapMessageEntry } from '../message/entry.js';
/**
 * Creates a logger for the given subsystem
 */
export const logger = (id, subsystem) => {
    const name = ['bitswap'];
    if (subsystem != null) {
        name.push(subsystem);
    }
    if (id != null) {
        name.push(`${id.toString().slice(0, 8)}`);
    }
    return createLogger(name.join(':'));
};
export const includesWith = (pred, x, list) => {
    let idx = 0;
    const len = list.length;
    while (idx < len) {
        if (pred(x, list[idx])) {
            return true;
        }
        idx += 1;
    }
    return false;
};
export const uniqWith = (pred, list) => {
    let idx = 0;
    const len = list.length;
    const result = [];
    let item;
    while (idx < len) {
        item = list[idx];
        if (!includesWith(pred, item, result)) {
            result[result.length] = item;
        }
        idx += 1;
    }
    return result;
};
export const groupBy = (pred, list) => {
    // @ts-expect-error cannot use {} as record with these key types?
    const output = {};
    return list.reduce((acc, v) => {
        const k = pred(v);
        if (acc[k] != null) {
            acc[k].push(v);
        }
        else {
            acc[k] = [v];
        }
        return acc;
    }, output);
};
export const pullAllWith = (pred, list, values) => {
    return list.filter(i => {
        return !includesWith(pred, i, values);
    });
};
export const sortBy = (fn, list) => {
    return Array.prototype.slice.call(list, 0).sort((a, b) => {
        const aa = fn(a);
        const bb = fn(b);
        return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
};
/**
 * Is equal for Maps of BitswapMessageEntry or Uint8Arrays
 */
export const isMapEqual = (a, b) => {
    if (a.size !== b.size) {
        return false;
    }
    for (const [key, valueA] of a) {
        const valueB = b.get(key);
        if (valueB === undefined) {
            return false;
        }
        // TODO: revisit this
        // Support Blocks
        if (valueA instanceof Uint8Array && valueB instanceof Uint8Array && !uint8ArrayEquals(valueA, valueB)) {
            return false;
        }
        // Support BitswapMessageEntry
        if (valueA instanceof BitswapMessageEntry && valueB instanceof BitswapMessageEntry && !valueA.equals(valueB)) {
            return false;
        }
    }
    return true;
};
//# sourceMappingURL=index.js.map