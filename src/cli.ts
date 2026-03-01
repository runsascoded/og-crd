import { parseArgs } from "node:util"
import { createInterface } from "node:readline"
import {
  CardOptions,
  fetchOgMeta,
  OgMeta,
  renderCard,
  renderCardGrid,
  renderCardRow,
} from "./core"

const OG_META_FIELDS = ["title", "description", "image", "siteName", "url"] as const

function mainUsage() {
  console.error(`Usage: og-card <command|url> [options]

Commands:
  md <url> [url2 ...]   Generate GitHub-compatible markdown/HTML cards

Default (no subcommand):
  og-card <url> [url2 ...] [options]

Options:
  -f, --field <name>     Output only one field (${OG_META_FIELDS.join(", ")})
  -j, --json             JSON output
  -p, --proxy <url>      CORS proxy prefix
  -P, --parallel <n>     Max concurrent fetches (default: 5)
  -h, --help             Show this help

Run "og-card md --help" for markdown subcommand options.`)
}

function mdUsage() {
  console.error(`Usage: og-card md <url> [url2 ...] [options]

Generate GitHub-compatible HTML cards from URLs.

Options:
  -c, --cols <n>         Cards per row (default: 2)
  -f, --format <type>    Output format: table (default), image, html
  -r, --row              Wrap output in <table><tr>...</tr></table>
  -w, --width <px>       Card width in pixels (default: 400)
      --no-desc          Omit description
      --no-title         Omit title below image
  -g, --github           Clean GitHub boilerplate from title/description
  -p, --proxy <url>      CORS proxy prefix
  -P, --parallel <n>     Max concurrent fetches (default: 5)
  -h, --help             Show this help`)
}

async function readStdin(): Promise<string[]> {
  const lines: string[] = []
  const rl = createInterface({ input: process.stdin })
  for await (const line of rl) {
    const trimmed = line.trim()
    if (trimmed) lines.push(trimmed)
  }
  return lines
}

async function fetchAll(
  urls: string[],
  proxy: string | undefined,
  parallel: number,
): Promise<Array<{ url: string; meta: OgMeta }>> {
  const results: Array<{ url: string; meta: OgMeta }> = []
  for (let i = 0; i < urls.length; i += parallel) {
    const batch = urls.slice(i, i + parallel)
    const metas = await Promise.all(
      batch.map(url => fetchOgMeta(url, proxy).catch(err => {
        console.error(`Error fetching ${url}: ${err.message}`)
        return {} as OgMeta
      }))
    )
    for (let j = 0; j < batch.length; j++) {
      results.push({ url: batch[j], meta: metas[j] })
    }
  }
  return results
}

function printMeta(url: string, meta: OgMeta, field?: string) {
  if (field) {
    const val = meta[field as keyof OgMeta]
    if (val) console.log(val)
    return
  }
  for (const key of OG_META_FIELDS) {
    if (meta[key]) console.log(`${key}: ${meta[key]}`)
  }
}

async function getUrls(positionals: string[]): Promise<string[]> {
  if (positionals.length > 0) return positionals
  if (process.stdin.isTTY) return []
  return readStdin()
}

// --- Default subcommand (og metadata fetch) ---

async function runDefault(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      field: { type: "string", short: "f" },
      json: { type: "boolean", short: "j", default: false },
      proxy: { type: "string", short: "p" },
      parallel: { type: "string", short: "P", default: "5" },
      help: { type: "boolean", short: "h", default: false },
    },
  })

  if (values.help) {
    mainUsage()
    process.exit(0)
  }

  if (values.field && !OG_META_FIELDS.includes(values.field as typeof OG_META_FIELDS[number])) {
    console.error(`Unknown field: ${values.field}`)
    console.error(`Valid fields: ${OG_META_FIELDS.join(", ")}`)
    process.exit(1)
  }

  const parallel = parseInt(values.parallel!, 10)
  const urls = await getUrls(positionals)

  if (urls.length === 0) {
    mainUsage()
    process.exit(1)
  }

  const results = await fetchAll(urls, values.proxy, parallel)

  if (values.json) {
    const out = results.map(r => ({ url: r.url, ...r.meta }))
    console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2))
  } else {
    for (let i = 0; i < results.length; i++) {
      if (urls.length > 1) console.log(`\n# ${results[i].url}`)
      printMeta(results[i].url, results[i].meta, values.field)
    }
  }
}

// --- `md` subcommand ---

function renderImageLink(url: string, meta: OgMeta, title: string): string {
  if (!meta.image) return `[${title}](${url})`
  return `[![${title}](${meta.image})](${url})`
}

async function runMd(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      cols: { type: "string", short: "c", default: "2" },
      format: { type: "string", short: "f", default: "table" },
      row: { type: "boolean", short: "r", default: false },
      width: { type: "string", short: "w", default: "400" },
      "no-desc": { type: "boolean", default: false },
      "no-title": { type: "boolean", default: false },
      github: { type: "boolean", short: "g", default: false },
      proxy: { type: "string", short: "p" },
      parallel: { type: "string", short: "P", default: "5" },
      help: { type: "boolean", short: "h", default: false },
    },
  })

  if (values.help) {
    mdUsage()
    process.exit(0)
  }

  const format = values.format as string
  if (!["table", "image", "html"].includes(format)) {
    console.error(`Unknown format: ${format}`)
    console.error(`Valid formats: table, image, html`)
    process.exit(1)
  }

  const urls = await getUrls(positionals)
  if (urls.length === 0) {
    mdUsage()
    process.exit(1)
  }

  const parallel = parseInt(values.parallel as string, 10)
  const cards = await fetchAll(urls, values.proxy, parallel)
  const cols = parseInt(values.cols as string, 10)
  const width = parseInt(values.width as string, 10)

  const cardOpts: CardOptions = {
    width,
    showTitle: !values["no-title"],
    showDesc: !values["no-desc"],
    cleanGitHub: values.github as boolean,
  }

  if (format === "image") {
    for (const { url, meta } of cards) {
      let title = meta.title ?? url
      if (cardOpts.cleanGitHub && /github\.com/.test(url)) {
        const m = url.match(/github\.com\/[^/]+\/([^/]+)/)
        if (m) title = m[1]
      }
      console.log(renderImageLink(url, meta, title))
    }
  } else if (format === "html") {
    for (const { url, meta } of cards) {
      console.log(renderCard(url, meta, cardOpts))
    }
  } else {
    // table format
    if (values.row || cards.length <= cols) {
      console.log(renderCardRow(cards, cardOpts))
    } else {
      console.log(renderCardGrid(cards, { ...cardOpts, cols }))
    }
  }
}

// --- Entry point ---

async function main() {
  const args = process.argv.slice(2)
  if (args[0] === "md") {
    await runMd(args.slice(1))
  } else {
    await runDefault(args)
  }
}

main()
