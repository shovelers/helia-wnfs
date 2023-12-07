/**
 * SortedMap is a Map whose iterator order can be defined by the user
 */
export declare class SortedMap<Key, Value> extends Map<Key, Value> {
    private readonly _cmp;
    private _keys;
    constructor(entries?: Array<[Key, Value]>, cmp?: (a: [Key, Value], b: [Key, Value]) => number);
    /**
     * Call update to update the position of the key when it should change.
     * For example if the compare function sorts by the priority field, and the
     * priority changes, call update.
     * Call indexOf() to get the index _before_ the change happens.
     */
    update(i: number): void;
    set(k: Key, v: Value): this;
    clear(): void;
    delete(k: Key): boolean;
    indexOf(k: Key): number;
    _find(k: Key): number;
    keys(): IterableIterator<Key>;
    values(): IterableIterator<Value>;
    entries(): IterableIterator<[Key, Value]>;
    [Symbol.iterator](): IterableIterator<[Key, Value]>;
    forEach(cb: (entry: [Key, Value]) => void, thisArg?: SortedMap<Key, Value>): void;
    _defaultSort(a: [Key, Value], b: [Key, Value]): 0 | 1 | -1;
    _kCmp(a: Key, b: Key): number;
}
//# sourceMappingURL=sorted-map.d.ts.map