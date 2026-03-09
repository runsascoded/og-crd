# og-crd

[![npm](https://img.shields.io/npm/v/og-crd)](https://www.npmjs.com/package/og-crd)

OG meta preview cards for **web** and **markdown**.

### Markdown — `og-card md`

Generate `<table>`-based HTML cards for GitHub READMEs, releases, and issues:

<table><tr>
<td width="300" valign="top">
<a href="https://github.com/runsascoded/img-voronoi">
<img src="https://repository-images.githubusercontent.com/1158873364/ada3e7a8-9e10-451a-8627-57561e5b2934" alt="img-voronoi" width="300">
<br><b>img-voronoi</b>
<br><sub>Interactive Voronoi diagram visualization from images, with animated site physics and a Rust CLI for video rendering.</sub>
</a>
</td>
<td width="300" valign="top">
<a href="https://github.com/hudcostreets/nj-crashes">
<img src="https://repository-images.githubusercontent.com/477882967/cd7a3b2e-9104-4607-907e-14b602c4ae02" alt="nj-crashes" width="300">
<br><b>nj-crashes</b>
<br><sub>Analysis and visualization of traffic crash data published by NJ DOT and NJ State Police</sub>
</a>
</td>
</tr></table>

```sh
og-card md https://github.com/runsascoded/img-voronoi https://github.com/hudcostreets/nj-crashes \
  --github -w 300
```

### Web — React components ([demo][demo])

<a href="https://og-crd.rbw.sh"><img src="demo/screenshot.png" alt="demo screenshot" width="600"></a>

Interactive cards with hover effects, favicons, and automatic GitHub title/description cleaning.

```tsx
import { OgCardFromUrl } from "og-crd"
import "og-crd/style.css"

<OgCardFromUrl url="https://github.com/runsascoded/img-voronoi" proxy="https://my-proxy.example.com/?url=" />
```

## Install

```sh
pnpm add og-crd
```

Peer dependencies: `react >= 18`, `react-dom >= 18` (only needed for components; `og-crd/core` and the CLI work without React).

## Components

Import components and their stylesheet:

```tsx
import { OgCard, OgCardFromUrl, CardRow } from "og-crd"
import "og-crd/style.css"
```

### `OgCard`

Renders a card with a thumbnail image, title, description, and optional overlay icons.

```tsx
<OgCard
  title="My Project"
  description="A short description"
  thumbnail="https://example.com/image.png"
  href="https://example.com"
/>
```

Without a `thumbnail`, renders a gradient placeholder showing the title.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | (required) | Card title |
| `thumbnail` | `string \| ReactNode` | | Image URL or custom element |
| `description` | `string` | | Subtitle text |
| `href` | `string` | | Link URL (wraps card in `<a>`) |
| `icons` | `ReactNode[]` | | Icons shown in overlay |
| `className` | `string` | | Additional CSS class |
| `aspectRatio` | `number` | `1.91` | Card aspect ratio |
| `hoverEffect` | `"scale" \| "shadow" \| "both" \| "none"` | `"both"` | Hover animation |

### `OgCardFromUrl`

Fetches OG metadata from a URL and renders an `OgCard`. Shows a skeleton loading state while fetching.

```tsx
<OgCardFromUrl
  url="https://github.com/runsascoded/img-voronoi"
  proxy="https://my-proxy.example.com/?url="
/>
```

A `proxy` is needed in browsers due to CORS. Pass a prefix string (the target URL is appended URL-encoded) or a `(url: string) => string` function. See [`cors-prxy`] for an easy-to-deploy per-project CORS proxy.

GitHub URLs are automatically cleaned: `OgCardFromUrl` strips "GitHub - owner/repo:" title prefixes and "Contribute to … on GitHub" description boilerplate.

All `OgCard` props (`title`, `description`, `thumbnail`, etc.) can be passed as overrides.

[`cors-prxy`]: https://github.com/runsascoded/cors-prxy

### `CardRow`

Horizontal scrolling row for multiple cards.

```tsx
<CardRow gap="1.5rem">
  <div style={{ width: 280 }}><OgCard title="A" thumbnail="..." /></div>
  <div style={{ width: 280 }}><OgCard title="B" thumbnail="..." /></div>
</CardRow>
```

## Core (React-free)

For use outside React (Node scripts, build tools, etc.):

```ts
import { fetchOgMeta, parseOgTags } from "og-crd/core"

const meta = await fetchOgMeta("https://example.com")
// { title, description, image, siteName, url }
```

The main entry point (`og-crd`) also re-exports these.

### GitHub-compatible card HTML

Generate `<table>`-based card HTML for embedding in GitHub READMEs:

```ts
import { fetchOgMeta, renderCard, renderCardRow, renderCardGrid } from "og-crd/core"

const meta = await fetchOgMeta("https://github.com/runsascoded/apvd")
renderCard("https://github.com/runsascoded/apvd", meta, { cleanGitHub: true })
// → <td width="400" valign="top"><a href="..."><img ...><br><b>apvd</b>...</a></td>

// Wrap multiple cards in a <table><tr> row
renderCardRow([{ url, meta }, ...], { width: 400 })

// Multi-row grid
renderCardGrid(cards, { cols: 2, cleanGitHub: true })
```

`cleanGitHubTitle` and `cleanGitHubDescription` strip GitHub boilerplate from OG metadata (title prefixes like "GitHub - owner/repo:", description suffixes like "Contribute to … on GitHub"). These are applied automatically by `OgCardFromUrl` for `github.com` URLs.

## `useOgMeta` hook

React hook wrapping `fetchOgMeta` with caching:

```ts
const { data, loading, error } = useOgMeta(url, proxy)
```

## CLI

```sh
og-card <url> [url2 ...] [options]
```

| Flag | Description |
|------|-------------|
| `-f, --field <name>` | Output one field: `title`, `description`, `image`, `siteName`, `url` |
| `-j, --json` | JSON output |
| `-p, --proxy <url>` | CORS proxy prefix |
| `-P, --parallel <n>` | Max concurrent fetches (default: 5) |

```sh
# Human-readable output
og-card https://example.com

# Just the image URL
og-card https://example.com -f image

# JSON, multiple URLs
og-card https://a.com https://b.com --json

# From stdin
echo "https://example.com" | og-card --json
```

### `og-card md`

4-column grid example:

```sh
og-card md https://github.com/HackJerseyCity/jc-taxes https://github.com/hudcostreets/path \
  https://github.com/hudcostreets/hudson-transit https://github.com/runsascoded/apvd \
  --github -w 200 --cols 4
```

<table><tr>
<td width="200" valign="top">
<a href="https://github.com/HackJerseyCity/jc-taxes">
<img src="https://repository-images.githubusercontent.com/1153088407/26ae854c-725b-4ca3-819e-cad30586484a" alt="jc-taxes" width="200">
<br><b>jc-taxes</b>
<br><sub>3D map of Jersey City property tax payments</sub>
</a>
</td>
<td width="200" valign="top">
<a href="https://github.com/hudcostreets/path">
<img src="https://repository-images.githubusercontent.com/802509466/c756c846-9634-4be3-8ea6-c80f1577a92d" alt="path" width="200">
<br><b>path</b>
<br><sub>PATH train ridership stats</sub>
</a>
</td>
<td width="200" valign="top">
<a href="https://github.com/hudcostreets/hudson-transit">
<img src="https://repository-images.githubusercontent.com/565013703/0dca3713-5c73-4a5f-bbbf-34abf5e8beb7" alt="hudson-transit" width="200">
<br><b>hudson-transit</b>
<br><sub>Hudson River crossing stats and analysis, from NYMTC's &quot;Hub Bound Travel&quot; reports</sub>
</a>
</td>
<td width="200" valign="top">
<a href="https://github.com/runsascoded/apvd">
<img src="https://opengraph.githubassets.com/7edc140c1d8001aac35706a3509456648d279accf7a8b42873d7f3f66f71f9d9/runsascoded/apvd" alt="apvd" width="200">
<br><b>apvd</b>
<br><sub>Area-Proportional Venn Diagrams</sub>
</a>
</td>
</tr></table>

```sh
# More examples
og-card md url1 url2 --row           # Force single-row layout
og-card md url1 -f image             # Markdown image link: [![title](img)](url)
og-card md url1 -f html              # Raw <td> cells (no <table> wrapper)
og-card md url1 --no-desc --no-title # Image only
```

| Flag | Description |
|------|-------------|
| `-c, --cols <n>` | Cards per row (default: 2) |
| `-f, --format <type>` | `table` (default), `image`, `html` |
| `-r, --row` | Wrap in `<table><tr>` |
| `-w, --width <px>` | Card width (default: 400) |
| `--no-desc` | Omit description |
| `--no-title` | Omit title |
| `-g, --github` | Strip GitHub boilerplate |
| `-p, --proxy <url>` | CORS proxy prefix |
| `-P, --parallel <n>` | Max concurrent fetches (default: 5) |

## CSS customization

Override CSS custom properties on `.og-card`:

```css
.og-card {
  --og-card-radius: 8px;
  --og-card-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  --og-card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.25);
  --og-card-overlay-bg: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.85));
  --og-card-title-color: #fff;
  --og-card-desc-color: rgba(255, 255, 255, 0.85);
  --og-card-placeholder-bg: linear-gradient(135deg, #667eea, #764ba2);
  --og-card-skeleton-bg: rgba(128, 128, 128, 0.2);
  --og-card-transition: 0.2s ease;
}
```

## CORS proxy

`OgCardFromUrl` fetches pages client-side, so a CORS proxy is needed. This project uses [`cors-prxy`] to deploy a per-project proxy (Cloudflare Worker or Lambda) with a strict allowlist:

```json
{
  "name": "og-crd",
  "allow": [
    { "domain": "github.com", "paths": [
      "/runsascoded/*",
      "/hudcostreets/*",
      "/HackJerseyCity/*"
    ]}
  ],
  "cors": {
    "origins": ["https://og-crd.rbw.sh", "http://localhost:*"]
  }
}
```

```sh
pnpm add -D cors-prxy
cors-prxy deploy   # creates Cloudflare Worker (or Lambda)
cors-prxy status   # shows endpoint URL
```

The endpoint URL is set as `VITE_CORS_PROXY_URL` (env var for local dev, [GitHub repo variable][gh-vars] for CI builds).

[gh-vars]: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables

## Development

```sh
pnpm dev          # Demo site at localhost:3847
pnpm build        # Library build → dist/
pnpm build:watch  # Rebuild on changes
pnpm demo:build   # Production demo build → demo/dist/
```

[demo]: https://og-crd.rbw.sh
