import batch from 'it-batch';
const DEFAULT_MAX_CHILDREN_PER_NODE = 174;
export function balanced(options) {
    const maxChildrenPerNode = options?.maxChildrenPerNode ?? DEFAULT_MAX_CHILDREN_PER_NODE;
    return async function balancedLayout(source, reduce) {
        const roots = [];
        for await (const chunked of batch(source, maxChildrenPerNode)) {
            roots.push(await reduce(chunked));
        }
        if (roots.length > 1) {
            return balancedLayout(roots, reduce);
        }
        return roots[0];
    };
}
//# sourceMappingURL=balanced.js.map