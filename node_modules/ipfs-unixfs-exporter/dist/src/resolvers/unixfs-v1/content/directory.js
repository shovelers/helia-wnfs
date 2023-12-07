import filter from 'it-filter';
import map from 'it-map';
import parallel from 'it-parallel';
import { pipe } from 'it-pipe';
import { CustomProgressEvent } from 'progress-events';
const directoryContent = (cid, node, unixfs, path, resolve, depth, blockstore) => {
    async function* yieldDirectoryContent(options = {}) {
        const offset = options.offset ?? 0;
        const length = options.length ?? node.Links.length;
        const links = node.Links.slice(offset, length);
        options.onProgress?.(new CustomProgressEvent('unixfs:exporter:walk:directory', {
            cid
        }));
        yield* pipe(links, source => map(source, link => {
            return async () => {
                const linkName = link.Name ?? '';
                const linkPath = `${path}/${linkName}`;
                const result = await resolve(link.Hash, linkName, linkPath, [], depth + 1, blockstore, options);
                return result.entry;
            };
        }), source => parallel(source, { ordered: true }), source => filter(source, entry => entry != null));
    }
    return yieldDirectoryContent;
};
export default directoryContent;
//# sourceMappingURL=directory.js.map