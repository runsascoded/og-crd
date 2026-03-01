import { useEffect, useState } from "react"
import { OgMeta, ProxyFn } from "./types"

const cache = new Map<string, OgMeta>()

function resolveProxy(url: string, proxy?: string | ProxyFn): string {
  if (!proxy) return url
  if (typeof proxy === "function") return proxy(url)
  return `${proxy}${encodeURIComponent(url)}`
}

function parseOgTags(html: string): OgMeta {
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

export function useOgMeta(url: string, proxy?: string | ProxyFn): {
  data: OgMeta | null
  loading: boolean
  error: Error | null
} {
  const [data, setData] = useState<OgMeta | null>(cache.get(url) ?? null)
  const [loading, setLoading] = useState(!cache.has(url))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (cache.has(url)) {
      setData(cache.get(url)!)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(resolveProxy(url, proxy))
      .then(r => r.text())
      .then(html => {
        if (cancelled) return
        const meta = parseOgTags(html)
        cache.set(url, meta)
        setData(meta)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [url, proxy])

  return { data, loading, error }
}
