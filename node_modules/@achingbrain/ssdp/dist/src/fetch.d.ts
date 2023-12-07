/// <reference types="node" />
export interface RequestInit {
    method?: 'POST' | 'GET';
    headers?: Record<string, string>;
    body?: Buffer | string;
}
export declare function fetch(url: string, init?: RequestInit): Promise<string>;
//# sourceMappingURL=fetch.d.ts.map