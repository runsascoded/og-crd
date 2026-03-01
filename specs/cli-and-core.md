# Spec: CLI + Core Module Refactor

## Problem

`parseOgTags` and `OgMeta` are the reusable core of this package, but they're coupled to the React hook in `useOgMeta.ts`. There's no CLI and no way to use the fetching/parsing logic outside of a React app.

## Changes

### 1. Extract core module: `src/core.ts`

Move pure, non-React code out of `useOgMeta.ts`:

```ts
// src/core.ts
export interface OgMeta {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
}

export type ProxyFn = (url: string) => string

export function resolveProxy(url: string, proxy?: string | ProxyFn): string { ... }
export function parseOgTags(html: string): OgMeta { ... }
export async function fetchOgMeta(url: string, proxy?: string | ProxyFn): Promise<OgMeta> {
  const res = await fetch(resolveProxy(url, proxy))
  return parseOgTags(await res.text())
}
```

- `OgMeta` and `ProxyFn` move from `types.ts` to `core.ts` (re-export from `types.ts` for BC)
- `parseOgTags` and `resolveProxy` extracted from `useOgMeta.ts`
- New `fetchOgMeta` async function (the non-hook equivalent of `useOgMeta`)
- `useOgMeta.ts` imports from `core.ts`, stays thin

### 2. Add CLI: `src/cli.ts`

```
og-card <url> [url2 ...] [--json] [--field image]
```

Examples:
```sh
# Single URL, human-readable
og-card https://github.com/HackJerseyCity/jc-taxes
# title: GitHub - HackJerseyCity/jc-taxes: 3D map of Jersey City property tax payments
# description: 3D map of Jersey City property tax payments...
# image: https://repository-images.githubusercontent.com/1153088407/26ae854c-...
# siteName: GitHub
# url: https://github.com/HackJerseyCity/jc-taxes

# Single URL, just the image
og-card https://github.com/HackJerseyCity/jc-taxes --field image
# https://repository-images.githubusercontent.com/1153088407/26ae854c-...

# Multiple URLs, JSON output
og-card https://github.com/runsascoded/apvd https://github.com/hudcostreets/nj-crashes --json
# [{"url":"...","title":"...","image":"..."}, ...]

# stdin (one URL per line)
echo "https://github.com/runsascoded/apvd" | og-card --json
```

Flags:
- `-f`, `--field <name>`: output only one field (title, description, image, siteName, url)
- `-j`, `--json`: JSON output
- `-p`, `--proxy <url>`: CORS proxy prefix (mainly for testing; not needed in Node)
- `-P`, `--parallel <n>`: max concurrent fetches (default: 5)

Implementation: use `tsx` shebang for dev, compile to JS for dist. Read URLs from args or stdin. Use `fetchOgMeta` from `core.ts`.

### 3. Package.json changes

```json
{
  "bin": {
    "og-card": "dist/cli.js"
  },
  "exports": {
    ".": { ... },
    "./core": {
      "import": "./dist/core.js",
      "types": "./dist/core.d.ts"
    },
    "./style.css": "./dist/style.css"
  }
}
```

Add `./core` export so consumers can import without React:
```ts
import { fetchOgMeta, parseOgTags } from "@rdub/og-card/core"
```

### 4. Update exports from `src/index.ts`

```ts
export { parseOgTags, fetchOgMeta, resolveProxy } from "./core"
export type { OgMeta, ProxyFn } from "./core"
// ... existing component exports
```

### 5. GitHub-specific enhancement (optional, phase 2)

For GitHub URLs, `fetchOgMeta` can optionally use the GraphQL API for more reliable data:

```ts
export async function fetchGitHubOgMeta(owner: string, repo: string): Promise<OgMeta & { usesCustomImage: boolean }> {
  // Uses `gh api graphql` or GitHub REST API
  // Returns openGraphImageUrl, usesCustomOpenGraphImage, description, homepageUrl
}
```

This avoids HTML parsing and gives the `usesCustomOpenGraphImage` boolean that plain OG scraping can't provide. Could be behind a `--github` flag in the CLI.

## Usage from `ryan-williams` build

After these changes, the profile README build script can:

```ts
import { fetchOgMeta } from "@rdub/og-card/core"

const meta = await fetchOgMeta("https://github.com/HackJerseyCity/jc-taxes")
// meta.image → the custom social preview URL
```

Or from the CLI during build:
```sh
og-card https://github.com/HackJerseyCity/jc-taxes -f image
```
