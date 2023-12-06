export class BaseBlockstore {
    has(key, options) {
        return Promise.reject(new Error('.has is not implemented'));
    }
    put(key, val, options) {
        return Promise.reject(new Error('.put is not implemented'));
    }
    async *putMany(source, options) {
        for await (const { cid, block } of source) {
            await this.put(cid, block, options);
            yield cid;
        }
    }
    get(key, options) {
        return Promise.reject(new Error('.get is not implemented'));
    }
    async *getMany(source, options) {
        for await (const key of source) {
            yield {
                cid: key,
                block: await this.get(key, options)
            };
        }
    }
    async delete(key, options) {
        await Promise.reject(new Error('.delete is not implemented'));
    }
    async *deleteMany(source, options) {
        for await (const key of source) {
            await this.delete(key, options);
            yield key;
        }
    }
    /**
     * Extending classes should override `query` or implement this method
     */
    async *getAll(options) {
        throw new Error('.getAll is not implemented');
    }
}
//# sourceMappingURL=base.js.map