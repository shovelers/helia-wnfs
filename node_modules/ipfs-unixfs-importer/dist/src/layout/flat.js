import all from 'it-all';
export function flat() {
    return async function flatLayout(source, reduce) {
        return reduce(await all(source));
    };
}
//# sourceMappingURL=flat.js.map