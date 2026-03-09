export interface OgMeta {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
}
export type ProxyFn = (url: string) => string;
export declare function resolveProxy(url: string, proxy?: string | ProxyFn): string;
export declare function decodeHtmlEntities(s: string): string;
export declare function parseOgTags(html: string, sourceUrl?: string): OgMeta;
export declare function fetchOgMeta(url: string, proxy?: string | ProxyFn): Promise<OgMeta>;
export interface CardOptions {
    width?: number;
    showTitle?: boolean;
    showDesc?: boolean;
    cleanGitHub?: boolean;
}
export declare function cleanGitHubDescription(desc: string): string;
export declare function cleanGitHubTitle(title: string, url: string): string;
export declare function renderCard(url: string, meta: OgMeta, opts?: CardOptions): string;
export declare function renderCardRow(cards: Array<{
    url: string;
    meta: OgMeta;
}>, opts?: CardOptions): string;
export declare function renderCardGrid(cards: Array<{
    url: string;
    meta: OgMeta;
}>, opts?: CardOptions & {
    cols?: number;
}): string;
