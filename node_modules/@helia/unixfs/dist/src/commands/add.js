import { importBytes, importByteStream, importDirectory, importer, importFile } from 'ipfs-unixfs-importer';
import { fixedSize } from 'ipfs-unixfs-importer/chunker';
import { balanced } from 'ipfs-unixfs-importer/layout';
/**
 * Default importer settings match Filecoin
 */
const defaultImporterSettings = {
    cidVersion: 1,
    rawLeaves: true,
    layout: balanced({
        maxChildrenPerNode: 1024
    }),
    chunker: fixedSize({
        chunkSize: 1048576
    })
};
export async function* addAll(source, blockstore, options = {}) {
    yield* importer(source, blockstore, {
        ...defaultImporterSettings,
        ...options
    });
}
export async function addBytes(bytes, blockstore, options = {}) {
    const { cid } = await importBytes(bytes, blockstore, {
        ...defaultImporterSettings,
        ...options
    });
    return cid;
}
export async function addByteStream(bytes, blockstore, options = {}) {
    const { cid } = await importByteStream(bytes, blockstore, {
        ...defaultImporterSettings,
        ...options
    });
    return cid;
}
export async function addFile(file, blockstore, options = {}) {
    const { cid } = await importFile(file, blockstore, {
        ...defaultImporterSettings,
        ...options
    });
    return cid;
}
export async function addDirectory(dir, blockstore, options = {}) {
    const { cid } = await importDirectory({
        ...dir,
        path: dir.path ?? '-'
    }, blockstore, {
        ...defaultImporterSettings,
        ...options
    });
    return cid;
}
//# sourceMappingURL=add.js.map