export interface OgMeta {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
}

export type ProxyFn = (url: string) => string

export function resolveProxy(url: string, proxy?: string | ProxyFn): string {
  if (!proxy) return url
  if (typeof proxy === "function") return proxy(url)
  return `${proxy}${encodeURIComponent(url)}`
}

export function parseOgTags(html: string): OgMeta {
  const get = (property: string): string | undefined => {
    const re = new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, "i")
    const match = html.match(re)
    if (match) return match[1]
    // Try reversed attribute order (content before property)
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, "i")
    const match2 = html.match(re2)
    return match2?.[1]
  }
  return {
    title: get("title"),
    description: get("description"),
    image: get("image"),
    siteName: get("site_name"),
    url: get("url"),
  }
}

export async function fetchOgMeta(url: string, proxy?: string | ProxyFn): Promise<OgMeta> {
  const res = await fetch(resolveProxy(url, proxy))
  return parseOgTags(await res.text())
}
