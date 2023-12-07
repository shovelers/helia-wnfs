/**
 * @packageDocumentation
 *
 * The final batch may be smaller than the max.
 *
 * @example
 *
 * ```javascript
 * import batch from 'it-batch'
 * import all from 'it-all'
 *
 * // This can also be an iterator, generator, etc
 * const values = [0, 1, 2, 3, 4]
 * const batchSize = 2
 *
 * const result = all(batch(values, batchSize))
 *
 * console.info(result) // [0, 1], [2, 3], [4]
 * ```
 *
 * Async sources must be awaited:
 *
 * ```javascript
 * import batch from 'it-batch'
 * import all from 'it-all'
 *
 * const values = async function * () {
 *   yield * [0, 1, 2, 3, 4]
 * }
 *
 * const batchSize = 2
 * const result = await all(batch(values(), batchSize))
 *
 * console.info(result) // [0, 1], [2, 3], [4]
 * ```
 */
/**
 * Takes an (async) iterable that emits things and returns an async iterable that
 * emits those things in fixed-sized batches
 */
declare function batch<T>(source: Iterable<T>, size?: number): Generator<T[], void, undefined>;
declare function batch<T>(source: Iterable<T> | AsyncIterable<T>, size?: number): AsyncGenerator<T[], void, undefined>;
export default batch;
//# sourceMappingURL=index.d.ts.map