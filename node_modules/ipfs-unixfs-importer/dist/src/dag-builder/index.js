import errCode from 'err-code';
import { CustomProgressEvent } from 'progress-events';
import { dirBuilder } from './dir.js';
import { fileBuilder } from './file.js';
function isIterable(thing) {
    return Symbol.iterator in thing;
}
function isAsyncIterable(thing) {
    return Symbol.asyncIterator in thing;
}
function contentAsAsyncIterable(content) {
    try {
        if (content instanceof Uint8Array) {
            return (async function* () {
                yield content;
            }());
        }
        else if (isIterable(content)) {
            return (async function* () {
                yield* content;
            }());
        }
        else if (isAsyncIterable(content)) {
            return content;
        }
    }
    catch {
        throw errCode(new Error('Content was invalid'), 'ERR_INVALID_CONTENT');
    }
    throw errCode(new Error('Content was invalid'), 'ERR_INVALID_CONTENT');
}
export function defaultDagBuilder(options) {
    return async function* dagBuilder(source, blockstore) {
        for await (const entry of source) {
            let originalPath;
            if (entry.path != null) {
                originalPath = entry.path;
                entry.path = entry.path
                    .split('/')
                    .filter(path => path != null && path !== '.')
                    .join('/');
            }
            if (isFileCandidate(entry)) {
                const file = {
                    path: entry.path,
                    mtime: entry.mtime,
                    mode: entry.mode,
                    content: (async function* () {
                        let bytesRead = 0n;
                        for await (const chunk of options.chunker(options.chunkValidator(contentAsAsyncIterable(entry.content)))) {
                            const currentChunkSize = BigInt(chunk.byteLength);
                            bytesRead += currentChunkSize;
                            options.onProgress?.(new CustomProgressEvent('unixfs:importer:progress:file:read', {
                                bytesRead,
                                chunkSize: currentChunkSize,
                                path: entry.path
                            }));
                            yield chunk;
                        }
                    })(),
                    originalPath
                };
                yield async () => fileBuilder(file, blockstore, options);
            }
            else if (entry.path != null) {
                const dir = {
                    path: entry.path,
                    mtime: entry.mtime,
                    mode: entry.mode,
                    originalPath
                };
                yield async () => dirBuilder(dir, blockstore, options);
            }
            else {
                throw new Error('Import candidate must have content or path or both');
            }
        }
    };
}
function isFileCandidate(entry) {
    return entry.content != null;
}
//# sourceMappingURL=index.js.map