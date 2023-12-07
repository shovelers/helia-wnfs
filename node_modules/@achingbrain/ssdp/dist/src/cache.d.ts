import type { Service } from './index.js';
declare class Cache {
    private services;
    constructor();
    hasService(serviceType: string, uniqueServiceName: string): boolean;
    getService(serviceType: string, uniqueServiceName: string): Service<Record<string, any>> | undefined;
    deleteService(serviceType: string, uniqueServiceName: string): void;
    cacheService(service: Service): void;
    clear(): void;
}
export declare const cache: Cache;
export {};
//# sourceMappingURL=cache.d.ts.map