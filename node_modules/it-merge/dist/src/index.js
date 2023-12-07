/**
 * @packageDocumentation
 *
 * Merge several (async)iterables into one, yield values as they arrive.
 *
 * Nb. sources are iterated over in parallel so the order of emitted items is not guaranteed.
 *
 * @example
 *
 * ```javascript
 * import merge from 'it-merge'
 * import all from 'it-all'
 *
 * // This can also be an iterator, generator, etc
 * const values1 = [0, 1, 2, 3, 4]
 * const values2 = [5, 6, 7, 8, 9]
 *
 * const arr = all(merge(values1, values2))
 *
 * console.info(arr) // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
 * ```
 *
 * Async sources must be awaited:
 *
 * ```javascript
 * import merge from 'it-merge'
 * import all from 'it-all'
 *
 * // This can also be an iterator, async iterator, generator, etc
 * const values1 = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 * const values2 = async function * () {
 *   yield * [5, 6, 7, 8, 9]
 * }
 *
 * const arr = await all(merge(values1(), values2()))
 *
 * console.info(arr) // 0, 1, 5, 6, 2, 3, 4, 7, 8, 9  <- nb. order is not guaranteed
 * ```
 */
import { pushable } from 'it-pushable';
function isAsyncIterable(thing) {
    return thing[Symbol.asyncIterator] != null;
}
function merge(...sources) {
    const syncSources = [];
    for (const source of sources) {
        if (!isAsyncIterable(source)) {
            syncSources.push(source);
        }
    }
    if (syncSources.length === sources.length) {
        // all sources are synchronous
        return (function* () {
            for (const source of syncSources) {
                yield* source;
            }
        })();
    }
    return (async function* () {
        const output = pushable({
            objectMode: true
        });
        void Promise.resolve().then(async () => {
            try {
                await Promise.all(sources.map(async (source) => {
                    for await (const item of source) {
                        output.push(item);
                    }
                }));
                output.end();
            }
            catch (err) {
                output.end(err);
            }
        });
        yield* output;
    })();
}
export default merge;
//# sourceMappingURL=index.js.map