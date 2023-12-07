import { Dir, type DirProps } from './dir.js';
import { type PersistOptions } from './utils/persist.js';
import type { ImportResult, InProgressImportResult } from './index.js';
import type { Blockstore } from 'interface-blockstore';
export declare class DirFlat extends Dir {
    private readonly _children;
    constructor(props: DirProps, options: PersistOptions);
    put(name: string, value: InProgressImportResult | Dir): Promise<void>;
    get(name: string): Promise<InProgressImportResult | Dir | undefined>;
    childCount(): number;
    directChildrenCount(): number;
    onlyChild(): InProgressImportResult | Dir;
    eachChildSeries(): AsyncGenerator<{
        key: string;
        child: InProgressImportResult | Dir;
    }, void, undefined>;
    estimateNodeSize(): number;
    flush(block: Blockstore): AsyncGenerator<ImportResult>;
}
//# sourceMappingURL=dir-flat.d.ts.map