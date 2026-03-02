# og-crd

React components for rendering Open Graph preview cards, plus a CLI and core library for fetching/parsing OG metadata.

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
  url="https://github.com/runsascoded/og-card"
  proxy="https://corsproxy.io/?"
/>
```

A `proxy` is needed in browsers due to CORS. Pass a prefix string (the target URL is appended URL-encoded) or a `(url: string) => string` function.

All `OgCard` props (`title`, `description`, `thumbnail`, etc.) can be passed as overrides.

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

`cleanGitHubDescription` strips boilerplate like "Contribute to ... on GitHub" from OG descriptions.

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

### `og-card md` — GitHub-compatible markdown cards

```sh
# Single card as <table>
og-card md https://github.com/owner/repo

# Row of cards
og-card md url1 url2 --row

# Grid (2 per row)
og-card md url1 url2 url3 url4 --cols 2

# Markdown image link format
og-card md https://github.com/owner/repo -f image

# Clean GitHub boilerplate from titles/descriptions
og-card md url1 url2 --github
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

## Development

```sh
pnpm dev          # Demo site at localhost:3847
pnpm build        # Library build → dist/
pnpm build:watch  # Rebuild on changes
```
