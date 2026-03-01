import { parseArgs } from "node:util"
import { createInterface } from "node:readline"
import { fetchOgMeta, OgMeta } from "./core"

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    field: { type: "string", short: "f" },
    json: { type: "boolean", short: "j", default: false },
    proxy: { type: "string", short: "p" },
    parallel: { type: "string", short: "P", default: "5" },
    help: { type: "boolean", short: "h", default: false },
  },
})

const OG_META_FIELDS = ["title", "description", "image", "siteName", "url"] as const

function usage() {
  console.error(`Usage: og-card <url> [url2 ...] [options]

Options:
  -f, --field <name>     Output only one field (${OG_META_FIELDS.join(", ")})
  -j, --json             JSON output
  -p, --proxy <url>      CORS proxy prefix
  -P, --parallel <n>     Max concurrent fetches (default: 5)
  -h, --help             Show this help`)
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

async function readStdin(): Promise<string[]> {
  const lines: string[] = []
  const rl = createInterface({ input: process.stdin })
  for await (const line of rl) {
    const trimmed = line.trim()
    if (trimmed) lines.push(trimmed)
  }
  return lines
}

async function processUrls(urls: string[], proxy: string | undefined, parallel: number, json: boolean, field?: string) {
  const results: Array<{ url: string } & OgMeta> = []
  // Process in batches of `parallel`
  for (let i = 0; i < urls.length; i += parallel) {
    const batch = urls.slice(i, i + parallel)
    const metas = await Promise.all(
      batch.map(url => fetchOgMeta(url, proxy).catch(err => {
        console.error(`Error fetching ${url}: ${err.message}`)
        return {} as OgMeta
      }))
    )
    for (let j = 0; j < batch.length; j++) {
      if (json) {
        results.push({ url: batch[j], ...metas[j] })
      } else {
        if (urls.length > 1) console.log(`\n# ${batch[j]}`)
        printMeta(batch[j], metas[j], field)
      }
    }
  }
  if (json) {
    console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2))
  }
}

async function main() {
  if (values.help) {
    usage()
    process.exit(0)
  }

  if (values.field && !OG_META_FIELDS.includes(values.field as typeof OG_META_FIELDS[number])) {
    console.error(`Unknown field: ${values.field}`)
    console.error(`Valid fields: ${OG_META_FIELDS.join(", ")}`)
    process.exit(1)
  }

  const parallel = parseInt(values.parallel!, 10)
  let urls = positionals

  if (urls.length === 0) {
    if (process.stdin.isTTY) {
      usage()
      process.exit(1)
    }
    urls = await readStdin()
  }

  if (urls.length === 0) {
    console.error("No URLs provided")
    process.exit(1)
  }

  await processUrls(urls, values.proxy, parallel, values.json!, values.field)
}

main()
