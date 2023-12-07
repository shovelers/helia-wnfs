import { CID } from 'multiformats/cid';
import type { WritableStorage, ImportResult, InProgressImportResult } from './index.js';
import type { PersistOptions } from './utils/persist.js';
import type { Mtime, UnixFS } from 'ipfs-unixfs';
export interface DirProps {
    root: boolean;
    dir: boolean;
    path: string;
    dirty: boolean;
    flat: boolean;
    parent?: Dir;
    parentKey?: string;
    unixfs?: UnixFS;
    mode?: number;
    mtime?: Mtime;
}
export declare abstract class Dir {
    options: PersistOptions;
    root: boolean;
    dir: boolean;
    path: string;
    dirty: boolean;
    flat: boolean;
    parent?: Dir;
    parentKey?: string;
    unixfs?: UnixFS;
    mode?: number;
    mtime?: Mtime;
    cid?: CID;
    size?: number;
    nodeSize?: number;
    constructor(props: DirProps, options: PersistOptions);
    abstract put(name: string, value: InProgressImportResult | Dir): Promise<void>;
    abstract get(name: string): Promise<InProgressImportResult | Dir | undefined>;
    abstract eachChildSeries(): AsyncIterable<{
        key: string;
        child: InProgressImportResult | Dir;
    }>;
    abstract flush(blockstore: WritableStorage): AsyncGenerator<ImportResult>;
    abstract estimateNodeSize(): number;
    abstract childCount(): number;
}
export declare const CID_V0: CID<unknown, number, number, import("multiformats/cid").Version>;
export declare const CID_V1: CID<unknown, number, number, import("multiformats/cid").Version>;
//# sourceMappingURL=dir.d.ts.map