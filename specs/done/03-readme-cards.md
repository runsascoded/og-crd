# Spec: Embeddable OG Cards for GitHub READMEs

## Context

GitHub READMEs can only render a limited subset of HTML (no CSS classes, no `<style>`, no JS). This makes it hard to create visually appealing project cards. We've prototyped a working pipeline in `ryan-williams/ryan-williams` that:

1. Uses `og-card`'s CLI/core to fetch OG metadata for URLs at build time
2. Renders MDX with custom `<Card>` components via `renderToStaticMarkup`
3. Produces GitHub-compatible HTML with `<table>` cells as cards (image + title + description)

This spec proposes moving that "static card for README" capability into `og-card` itself, so any project can use it.

## Use cases

1. **GitHub profile README** (`ryan-williams/ryan-williams`): gallery of project cards
2. **"Usage in the wild" sections** (e.g. `use-kbd/README.md`): show downstream projects as visual cards instead of plain bullet lists
3. **Awesome lists / curated collections**: any README that links to multiple projects/sites

## Current state (what works today)

### CLI fetching

```sh
# Fetch OG data for any URL
og-card https://github.com/HackJerseyCity/jc-taxes --json
# → { "title": "...", "description": "...", "image": "https://repository-images.githubusercontent.com/..." }

# Batch fetch
og-card url1 url2 url3 --json

# Just the image URL
og-card https://github.com/HackJerseyCity/jc-taxes -f image
```

### Programmatic (Node.js build scripts)

```ts
import { fetchOgMeta } from "@rdub/og-card/core"

const meta = await fetchOgMeta("https://github.com/HackJerseyCity/jc-taxes")
// meta.image → custom social preview or auto-generated card
```

### GitHub-compatible HTML card pattern

The only reliable card layout in GitHub markdown uses `<table>` cells:

```html
<table><tr>
<td width="400" valign="top">
  <a href="https://github.com/owner/repo">
    <img src="{og:image}" alt="owner/repo" width="400">
    <br><b>repo-name</b>
  </a>
  <br><sub>Description text here</sub>
</td>
<td width="400" valign="top">
  ...second card...
</td>
</tr></table>
```

Key constraints:
- GitHub strips CSS classes, `<style>`, inline `style` attributes
- `<table>`, `<td>`, `<img>`, `<a>`, `<b>`, `<sub>`, `<br>` all work
- `width` and `valign` attributes on `<td>` work
- Images: must be `<img src>` (external URLs proxied through `camo.githubusercontent.com`)
- `<picture>` + `<source media="(prefers-color-scheme: ...)">` works for dark/light mode

## Proposed additions to `og-card`

### 1. CLI: `og-card md` subcommand

Generate GitHub-compatible markdown/HTML cards from URLs:

```sh
# Single card (outputs HTML)
og-card md https://github.com/HackJerseyCity/jc-taxes
# → <td width="400" valign="top"><a href="...">...</a></td>

# Card row (wraps in <table><tr>)
og-card md https://github.com/owner/repo1 https://github.com/owner/repo2 --row
# → <table><tr><td>...</td><td>...</td></tr></table>

# Multiple rows from stdin (2 per row)
cat urls.txt | og-card md --cols 2

# Just output markdown image link (simpler, no table)
og-card md https://github.com/owner/repo --format image
# → [![repo](https://og-image-url)](https://github.com/owner/repo)

# Custom width
og-card md https://github.com/owner/repo --width 300
```

Options:
- `-c`, `--cols <n>`: cards per row (default: 2)
- `-f`, `--format <type>`: `table` (default), `image` (just img link), `html` (raw `<td>`)
- `-r`, `--row`: wrap output in `<table><tr>...</tr></table>`
- `-w`, `--width <px>`: card width (default: 400)
- `--no-desc`: omit description
- `--no-title`: omit title below image
- `--github`: for GitHub repo URLs, clean up title/description (strip "GitHub - " prefix, "Contribute to..." boilerplate, trailing "- owner/repo")

### 2. Core: `renderCard` / `renderCardRow` functions

Non-React, pure string functions for generating card HTML:

```ts
// src/core.ts additions

export interface CardOptions {
  width?: number       // default: 400
  showTitle?: boolean  // default: true
  showDesc?: boolean   // default: true
  cleanGitHub?: boolean // default: true — strip GitHub boilerplate from title/desc
}

export function renderCard(url: string, meta: OgMeta, opts?: CardOptions): string
export function renderCardRow(cards: Array<{ url: string, meta: OgMeta }>, opts?: CardOptions): string
export function renderCardGrid(cards: Array<{ url: string, meta: OgMeta }>, opts?: CardOptions & { cols?: number }): string
```

These return raw HTML strings suitable for insertion into `.md` files. No React dependency.

### 3. Core: GitHub-specific OG helpers

```ts
// src/github.ts

export interface GitHubOgMeta extends OgMeta {
  usesCustomImage: boolean
  owner: string
  repo: string
  homepageUrl?: string
}

// Uses GitHub GraphQL API (requires `gh` CLI auth)
export async function fetchGitHubOgMeta(owner: string, repo: string): Promise<GitHubOgMeta>

// Batch query (up to 100 repos per API call)
export async function fetchGitHubOgMetaBatch(
  repos: Array<{ owner: string, repo: string }>
): Promise<GitHubOgMeta[]>

// Clean GitHub OG descriptions
export function cleanGitHubDescription(desc: string): string
// Strips: "Contribute to ... GitHub.", trailing "- owner/repo", HTML entities
```

### 4. Optional: React components for MDX build pipelines

For projects using the MDX → `renderToStaticMarkup` → README pattern (like `ryan-williams`):

```tsx
// src/readme.tsx — React components that render GitHub-compatible HTML

export const ReadmeCard: FC<{ url: string; meta?: OgMeta; width?: number }>
export const ReadmeCardRow: FC<{ children: ReactNode }>
```

These are thin wrappers that produce the same HTML as the core `renderCard` functions, but usable in MDX/JSX. They read from an injected OG data map (same pattern as `ryan-williams`'s `setOgData`).

## Example: use-kbd "Usage in the wild"

### Before (plain list)
```md
- [ctbk.dev](https://ctbk.dev) — Citi Bike trip data explorer
  - [GitHub](https://github.com/hudcostreets/ctbk.dev) · [usage](...)
- [awair](https://air.rbw.sh) — Awair air quality dashboard
  - [GitHub](https://github.com/runsascoded/awair) · [usage](...)
```

### After (OG cards, generated at build time)
```sh
og-card md \
  https://github.com/hudcostreets/ctbk.dev \
  https://github.com/runsascoded/awair \
  https://github.com/HackJerseyCity/jc-taxes \
  https://github.com/runsascoded/img-voronoi \
  --cols 2 --github >> README.md
```

Produces:
```html
<table><tr>
<td width="400" valign="top">
<a href="https://github.com/hudcostreets/ctbk.dev">
<img src="https://opengraph.githubassets.com/.../ctbk.dev" width="400">
<br><b>ctbk.dev</b></a>
<br><sub>Analysis and visualization of Citi Bike data</sub>
</td>
<td width="400" valign="top">
<a href="https://github.com/runsascoded/awair">
<img src="https://opengraph.githubassets.com/.../awair" width="400">
<br><b>awair</b></a>
<br><sub>"Awair" air quality sensor dashboard</sub>
</td>
</tr></table>
...
```

## Implementation order

1. `cleanGitHubDescription` + `renderCard` / `renderCardRow` / `renderCardGrid` in `src/core.ts`
2. `og-card md` CLI subcommand
3. GitHub GraphQL helpers in `src/github.ts` (optional, for `usesCustomImage` detection)
4. `ReadmeCard` / `ReadmeCardRow` React components in `src/readme.tsx` (optional, for MDX pipelines)

## Reference: `ryan-williams/ryan-williams` implementation

The profile README repo is the working prototype. Key files:

- `src/build.tsx`: fetches OG data via `fetchOgMeta`, compiles MDX, renders to static HTML
- `src/components.tsx`: `Card` (renders `<td>` with image + title + desc), `CardRow` (wraps in `<table><tr>`)
- `src/README.mdx`: uses `<CardRow><Card repo="..." /></CardRow>` syntax

The pattern works but is bespoke to that project. This spec extracts the reusable parts into `og-card`.
