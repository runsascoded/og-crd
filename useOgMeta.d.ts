import { OgMeta, ProxyFn } from './core';
export declare function useOgMeta(url: string, proxy?: string | ProxyFn): {
    data: OgMeta | null;
    loading: boolean;
    error: Error | null;
};
