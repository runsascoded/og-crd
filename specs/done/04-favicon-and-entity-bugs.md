# og-card: favicon fallback + HTML entity bugs

## 1. Fall back to favicon when no `og:image`

When a page has no `og:image` meta tag, og-card should look for a favicon to use as the card image. Many SPAs (Vite apps, etc.) have no OG tags but do have a favicon.

**Sources to check (in priority order):**

1. `<link rel="apple-touch-icon" href="...">` — highest res, usually 180×180+
2. `<link rel="icon" type="image/png" href="...">` — explicit PNG icon
3. `<link rel="icon" href="...">` — any format
4. `/favicon.ico` — convention fallback

**Examples:**

```bash
og-card https://runsascoded.com/apvd
# Currently returns empty
# Has: <link rel="icon" type="image/png" href="/apvd/img/screenshots/3-circles.png" />

og-card https://voro.rbw.sh
# Currently returns empty
# Has: <link rel="icon" href="/icon.jpg" />
```

Similarly, fall back to `<title>` when no `og:title`.

## 2. HTML entities double-escaped in `--github` mode

```bash
og-card md https://github.com/runsascoded/awair --github
```

Produces:

```html
<sub>&amp;quot;Awair&amp;quot; air quality sensor dashboard</sub>
```

The GitHub OG description contains `&quot;Awair&quot;`, and `--github` mode doesn't decode HTML entities before embedding into the output HTML. The entities get escaped again → `&amp;quot;`.

### Fix

Decode HTML entities in OG metadata values after parsing (e.g., `he.decode()` or a simple replacement of common entities: `&quot;` → `"`, `&amp;` → `&`, `&lt;`/`&gt;`).

## 3. `--github` doesn't strip `owner/repo:` prefix from title

```bash
og-card md https://github.com/runsascoded/ImageVoronoi --github
```

Produces title:

```
runsascoded/img-voronoi: Interactive Voronoi diagram visualization from images, with animated site physics and a Rust CLI for video rendering.
```

The `--github` flag strips the `"GitHub - "` prefix but not the `"owner/repo: "` prefix from the title. Expected output: just the description portion, or at most the repo name without the owner prefix.
