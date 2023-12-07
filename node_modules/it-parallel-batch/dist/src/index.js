/**
 * @packageDocumentation
 *
 * Takes an async iterator that emits promise-returning functions, invokes them in parallel and emits the results in the same order as the input.
 *
 * The final batch may be smaller than the batch size.
 *
 * @example
 *
 * ```javascript
 * import parallelBatch from 'it-parallel-batch'
 * import all from 'it-all'
 * import delay from 'delay'
 *
 * // This can also be an iterator, async iterator, generator, etc
 * const input = [
 *   async () => {
 *     await delay(500)
 *
 *     return 1
 *   },
 *   async () => {
 *     await delay(200)
 *
 *     return 2
 *   },
 *   async () => {
 *     await delay(100)
 *
 *     return 3
 *   }
 * ]
 *
 * const batchSize = 2
 *
 * const result = await all(parallelBatch(input, batchSize))
 *
 * console.info(result) // [1, 2, 3]
 * ```
 */
import batch from 'it-batch';
/**
 * Takes an (async) iterator that emits promise-returning functions,
 * invokes them in parallel and emits the results as they become available but
 * in the same order as the input
 */
export default async function* parallelBatch(source, size = 1) {
    for await (const tasks of batch(source, size)) {
        const things = tasks.map(async (p) => {
            return p().then(value => ({ ok: true, value }), err => ({ ok: false, err }));
        });
        for (let i = 0; i < things.length; i++) {
            const result = await things[i];
            if (result.ok) {
                yield result.value;
            }
            else {
                throw result.err;
            }
        }
    }
}
//# sourceMappingURL=index.js.map