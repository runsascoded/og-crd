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

// --- GitHub-compatible markdown/HTML card rendering ---

export interface CardOptions {
  width?: number
  showTitle?: boolean
  showDesc?: boolean
  cleanGitHub?: boolean
}

const GITHUB_DESC_BOILERPLATE = [
  /^Contribute to .+ on GitHub\.?$/i,
  /\.?\s*Contribute to .+ on GitHub\.?$/i,
  /^GitHub - [^:]+: /,
  / - [A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/,
]

const GITHUB_TITLE_PREFIX = /^GitHub - /

export function cleanGitHubDescription(desc: string): string {
  let cleaned = desc.trim()
  for (const re of GITHUB_DESC_BOILERPLATE) {
    if (re.test(cleaned)) {
      cleaned = cleaned.replace(re, "")
    }
  }
  return cleaned.trim()
}

function cleanGitHubTitle(title: string, url: string): string {
  let cleaned = title.replace(GITHUB_TITLE_PREFIX, "")
  // "owner/repo: description" → just "repo"
  const ghMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (ghMatch) {
    const ownerRepo = `${ghMatch[1]}/${ghMatch[2]}`
    if (cleaned.startsWith(`${ownerRepo}: `)) {
      cleaned = ghMatch[2]
    } else if (cleaned === ownerRepo) {
      cleaned = ghMatch[2]
    }
  }
  return cleaned.trim()
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export function renderCard(url: string, meta: OgMeta, opts?: CardOptions): string {
  const width = opts?.width ?? 400
  const showTitle = opts?.showTitle ?? true
  const showDesc = opts?.showDesc ?? true
  const isGitHub = opts?.cleanGitHub ?? true

  let title = meta.title ?? ""
  let desc = meta.description ?? ""

  if (isGitHub && /github\.com/.test(url)) {
    if (title) title = cleanGitHubTitle(title, url)
    if (desc) desc = cleanGitHubDescription(desc)
  }

  const parts: string[] = []
  if (meta.image) {
    parts.push(`<img src="${escapeHtml(meta.image)}" alt="${escapeHtml(title)}" width="${width}">`)
  }
  if (showTitle && title) {
    parts.push(`<br><b>${escapeHtml(title)}</b>`)
  }
  if (showDesc && desc) {
    parts.push(`<br><sub>${escapeHtml(desc)}</sub>`)
  }

  const inner = parts.join("\n")
  return `<td width="${width}" valign="top">\n<a href="${escapeHtml(url)}">\n${inner}\n</a>\n</td>`
}

export function renderCardRow(cards: Array<{ url: string; meta: OgMeta }>, opts?: CardOptions): string {
  const cells = cards.map(c => renderCard(c.url, c.meta, opts))
  return `<table><tr>\n${cells.join("\n")}\n</tr></table>`
}

export function renderCardGrid(
  cards: Array<{ url: string; meta: OgMeta }>,
  opts?: CardOptions & { cols?: number },
): string {
  const cols = opts?.cols ?? 2
  const rows: string[] = []
  for (let i = 0; i < cards.length; i += cols) {
    const rowCards = cards.slice(i, i + cols)
    const cells = rowCards.map(c => renderCard(c.url, c.meta, opts))
    rows.push(`<tr>\n${cells.join("\n")}\n</tr>`)
  }
  return `<table>\n${rows.join("\n")}\n</table>`
}
