import { CID } from 'multiformats/cid';
import type { PBNode } from '@ipld/dag-pb';
import type { Bucket } from 'hamt-sharding';
import type { Blockstore } from 'interface-blockstore';
import type { UnixFS } from 'ipfs-unixfs';
import type { ProgressOptions, ProgressEvent } from 'progress-events';
export interface ExportProgress {
    /**
     * How many bytes of the file have been read
     */
    bytesRead: bigint;
    /**
     * How many bytes of the file will be read - n.b. this may be
     * smaller than `fileSize` if `offset`/`length` have been
     * specified
     */
    totalBytes: bigint;
    /**
     * The size of the file being read - n.b. this may be
     * larger than `total` if `offset`/`length` has been
     * specified
     */
    fileSize: bigint;
}
export interface ExportWalk {
    cid: CID;
}
/**
 * Progress events emitted by the exporter
 */
export type ExporterProgressEvents = ProgressEvent<'unixfs:exporter:progress:unixfs:file', ExportProgress> | ProgressEvent<'unixfs:exporter:progress:unixfs:raw', ExportProgress> | ProgressEvent<'unixfs:exporter:progress:raw', ExportProgress> | ProgressEvent<'unixfs:exporter:progress:identity', ExportProgress> | ProgressEvent<'unixfs:exporter:walk:file', ExportWalk> | ProgressEvent<'unixfs:exporter:walk:directory', ExportWalk> | ProgressEvent<'unixfs:exporter:walk:hamt-sharded-directory', ExportWalk> | ProgressEvent<'unixfs:exporter:walk:raw', ExportWalk>;
export interface ExporterOptions extends ProgressOptions<ExporterProgressEvents> {
    offset?: number;
    length?: number;
    signal?: AbortSignal;
}
export interface Exportable<T> {
    type: 'file' | 'directory' | 'object' | 'raw' | 'identity';
    name: string;
    path: string;
    cid: CID;
    depth: number;
    size: bigint;
    content: (options?: ExporterOptions) => AsyncGenerator<T, void, unknown>;
}
export interface UnixFSFile extends Exportable<Uint8Array> {
    type: 'file';
    unixfs: UnixFS;
    node: PBNode;
}
export interface UnixFSDirectory extends Exportable<UnixFSEntry> {
    type: 'directory';
    unixfs: UnixFS;
    node: PBNode;
}
export interface ObjectNode extends Exportable<any> {
    type: 'object';
    node: Uint8Array;
}
export interface RawNode extends Exportable<Uint8Array> {
    type: 'raw';
    node: Uint8Array;
}
export interface IdentityNode extends Exportable<Uint8Array> {
    type: 'identity';
    node: Uint8Array;
}
export type UnixFSEntry = UnixFSFile | UnixFSDirectory | ObjectNode | RawNode | IdentityNode;
export interface NextResult {
    cid: CID;
    name: string;
    path: string;
    toResolve: string[];
}
export interface ResolveResult {
    entry: UnixFSEntry;
    next?: NextResult;
}
export interface Resolve {
    (cid: CID, name: string, path: string, toResolve: string[], depth: number, blockstore: ReadableStorage, options: ExporterOptions): Promise<ResolveResult>;
}
export interface Resolver {
    (cid: CID, name: string, path: string, toResolve: string[], resolve: Resolve, depth: number, blockstore: ReadableStorage, options: ExporterOptions): Promise<ResolveResult>;
}
export type UnixfsV1FileContent = AsyncIterable<Uint8Array> | Iterable<Uint8Array>;
export type UnixfsV1DirectoryContent = AsyncIterable<UnixFSEntry> | Iterable<UnixFSEntry>;
export type UnixfsV1Content = UnixfsV1FileContent | UnixfsV1DirectoryContent;
export interface UnixfsV1Resolver {
    (cid: CID, node: PBNode, unixfs: UnixFS, path: string, resolve: Resolve, depth: number, blockstore: ReadableStorage): (options: ExporterOptions) => UnixfsV1Content;
}
export interface ShardTraversalContext {
    hamtDepth: number;
    rootBucket: Bucket<boolean>;
    lastBucket: Bucket<boolean>;
}
export type ReadableStorage = Pick<Blockstore, 'get'>;
export declare function walkPath(path: string | CID, blockstore: ReadableStorage, options?: ExporterOptions): AsyncGenerator<UnixFSEntry, void, any>;
export declare function exporter(path: string | CID, blockstore: ReadableStorage, options?: ExporterOptions): Promise<UnixFSEntry>;
export declare function recursive(path: string | CID, blockstore: ReadableStorage, options?: ExporterOptions): AsyncGenerator<UnixFSEntry, void, any>;
//# sourceMappingURL=index.d.ts.map