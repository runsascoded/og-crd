import { useEffect, useState } from "react"
import { fetchOgMeta, OgMeta, ProxyFn } from "./core"

const cache = new Map<string, OgMeta>()

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
    fetchOgMeta(url, proxy)
      .then(meta => {
        if (cancelled) return
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
