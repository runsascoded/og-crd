# `@rdub/og-card` — OG-image-style card component library

## Overview

A lightweight React component library for rendering cards in og:image aspect ratio (≈1.91:1). Supports two modes:

1. **Static mode** — render cards from local props (thumbnail URL/node, title, description)
2. **Fetch mode** — given a URL, fetch its og metadata and render automatically

Designed for project showcases and portfolio pages.

## Components

### `<OgCard>` (static mode)

Renders a single card from explicit props. This is the core rendering component — `<OgCardFromUrl>` delegates to it after fetching.

**Props:**

```ts
interface OgCardProps {
  thumbnail?: string | ReactNode  // Image URL or custom ReactNode
  title: string
  description?: string
  icons?: ReactNode[]             // Tech/platform icons rendered in overlay
  href?: string                   // Wraps card in <a> if provided
  className?: string
  aspectRatio?: number            // Default: 1.91 (og:image standard)
  hoverEffect?: "scale" | "shadow" | "both" | "none"  // Default: "both"
}
```

**Behavior:**

- Card maintains `aspectRatio` via `aspect-ratio` CSS property
- `thumbnail` as string: rendered as `<img>` with `object-fit: cover` filling the card
- `thumbnail` as ReactNode: rendered directly inside the card container
- Missing `thumbnail`: renders placeholder — gradient background with centered title in large text
- Dark gradient overlay (`linear-gradient(transparent 40%, rgba(0,0,0,0.85))`) at bottom with:
  - `title` as heading
  - `description` as smaller text below
  - `icons` row at bottom-right of overlay
- Hover effects:
  - `"scale"`: `transform: scale(1.03)`
  - `"shadow"`: elevated `box-shadow`
  - `"both"`: both scale + shadow (default)
  - `"none"`: no hover effect
- `border-radius: 8px`, `overflow: hidden`
- Transitions on hover: `0.2s ease`

**Placeholder variant:**

When `thumbnail` is omitted, the card renders with:
- CSS gradient background (customizable via `--og-card-placeholder-bg` custom property, default: `linear-gradient(135deg, #667eea, #764ba2)`)
- Title centered vertically and horizontally in large white text
- No bottom overlay (title is the main content)

### `<OgCardFromUrl>` (fetch mode)

Given a URL, fetches og metadata and renders an `<OgCard>`.

**Props:**

```ts
interface OgCardFromUrlProps {
  url: string                           // URL to fetch og tags from
  proxy?: string | ProxyFn              // CORS proxy (required in browser)
  icons?: ReactNode[]                   // Passed through to OgCard
  className?: string
  aspectRatio?: number
  hoverEffect?: "scale" | "shadow" | "both" | "none"
  // Override fetched values (local wins over fetched):
  title?: string
  description?: string
  thumbnail?: string | ReactNode
}

type ProxyFn = (url: string) => string  // e.g. url => `/api/og?url=${url}`
```

**Behavior:**

- Fetches og metadata via `useOgMeta(url, proxy)` hook
- Renders loading skeleton (pulsing placeholder at correct aspect ratio) while fetching
- On success: renders `<OgCard>` with fetched `og:title`, `og:description`, `og:image`
- Explicit props override fetched values (e.g. pass `title` to override `og:title`)
- On error: renders placeholder card with the URL's hostname as title
- `href` defaults to `url`

### `useOgMeta` hook

Fetches and parses og metadata from a URL. Exported for consumers who want custom rendering.

```ts
interface OgMeta {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
}

function useOgMeta(url: string, proxy?: string | ProxyFn): {
  data: OgMeta | null
  loading: boolean
  error: Error | null
}
```

**Implementation:**

- `fetch()` the URL (through proxy if provided) and parse `<meta property="og:*">` tags from the HTML
- Simple regex/DOMParser extraction — no heavyweight dependency
- Caches results by URL in a module-level `Map` (survives re-renders, not page reloads)
- `proxy` as string: prepended to URL (e.g. `"https://corsproxy.io/?"`). As function: called with URL to produce fetch target.

### `<CardRow>`

Horizontal scrolling row of cards with CSS scroll-snap.

**Props:**

```ts
interface CardRowProps {
  children: ReactNode
  className?: string
  gap?: number | string   // Default: "1rem"
}
```

**Behavior:**

- `display: flex`, `overflow-x: auto`, `scroll-snap-type: x mandatory`
- Each direct child gets `scroll-snap-align: start`, `flex-shrink: 0`
- Scrollbar styled thin (`::-webkit-scrollbar` + `scrollbar-width: thin`)
- No wrapping — horizontal scroll only
- Gap between cards configurable

## Styling

### CSS custom properties (theming)

```css
--og-card-radius: 8px;
--og-card-shadow: 0 2px 8px rgba(0,0,0,0.15);
--og-card-shadow-hover: 0 8px 24px rgba(0,0,0,0.25);
--og-card-overlay-bg: linear-gradient(transparent 40%, rgba(0,0,0,0.85));
--og-card-title-color: #fff;
--og-card-desc-color: rgba(255,255,255,0.85);
--og-card-placeholder-bg: linear-gradient(135deg, #667eea, #764ba2);
--og-card-skeleton-bg: rgba(128,128,128,0.2);
--og-card-transition: 0.2s ease;
```

### Exports

- `og-card.scss` — SCSS source with variables and mixins
- `og-card.css` — Compiled CSS (generated at build time)
- Consumers can import either, or use CSS custom properties to override defaults

## Package setup

- **Name:** `@rdub/og-card`
- **Peer deps:** `react` (>=18), `react-dom` (>=18)
- **No runtime deps** — no MUI, no icon libraries. Og tag parsing uses `DOMParser` (browser built-in) or regex fallback.
- **Build:** Vite library mode, outputs ESM + CJS
- **Publish:** via `npm-dist` (dist branch on GitHub/GitLab)
- **Source:** SCSS compiled to CSS at build time; both shipped in package

## File structure

```
src/
  OgCard.tsx
  OgCardFromUrl.tsx
  CardRow.tsx
  useOgMeta.ts
  og-card.scss
  types.ts
  index.ts          # re-exports all components, hook, and types
package.json
vite.config.ts      # library mode config
tsconfig.json
```

## Exports (`index.ts`)

```ts
export { OgCard } from "./OgCard"
export { OgCardFromUrl } from "./OgCardFromUrl"
export { CardRow } from "./CardRow"
export { useOgMeta } from "./useOgMeta"
export type { OgCardProps, OgCardFromUrlProps, CardRowProps, OgMeta, ProxyFn } from "./types"
```
