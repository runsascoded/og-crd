# Split og-crd into workspace: library + demo site

## Context

`og-crd` is both an npm library (`og-crd`) and a demo site (`og-crd.rbw.sh`). Currently `demo/` has `vite.config.ts`, `main.tsx`, and `index.html` but no `package.json` — it shares the parent's deps and is built via `"demo:build": "vite build --config demo/vite.config.ts demo"` in the root scripts.

This works but has drawbacks:
- `demo/` isn't discoverable as a separate project (e.g. by `dep-idx` scanner)
- Demo-only deps (`cors-prxy`, `react`, `react-dom`) live in root `devDependencies`
- No independent dev server config (port, allowedHosts, etc.)
- The pattern diverges from other projects (`dep-viz`, `use-kbd`, `awair`, etc.) that use pnpm workspaces

## Plan

### 1. Rename `demo/` → `site/`

Match the convention used by `use-kbd/site`, `dep-viz/site`.

### 2. Create `pnpm-workspace.yaml`

```yaml
packages:
  - site
```

Root `og-crd` package stays at `.` (not in a `www/` subdir) since it's already published with that structure.

### 3. Create `site/package.json`

```json
{
  "name": "og-crd-site",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "clean": "rm -rf node_modules/.vite dist"
  },
  "dependencies": {
    "og-crd": "workspace:*",
    "cors-prxy": "<current SHA from root package.json>",
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "sass-embedded": "^1.77.8",
    "typescript": "^5.5.3",
    "vite": "^5.4.11"
  }
}
```

### 4. Update `site/vite.config.ts`

Add a unique port and `allowedHosts`:

```ts
const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',') ?? []

export default defineConfig({
  plugins: [react()],
  server: {
    port: <pick unique port>,
    host: true,
    allowedHosts,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
```

### 5. Create `site/tsconfig.json`

Reference the root for library types, or standalone config for the site app.

### 6. Update `site/main.tsx` imports

Change `from "../src"` → `from "og-crd"` (now resolves via workspace link).

### 7. Clean up root `package.json`

- Remove `"demo:build"` script (site builds itself now)
- Move demo-only deps (`cors-prxy`) to `site/package.json`
- `cors-prxy` stays in root only if the library itself uses it (it doesn't — it's a demo/site concern)

### 8. Run `pnpm install`, verify

- `pnpm dev` in `site/` serves the demo
- `pnpm build` in root still builds the library
- `pnpm build` in `site/` builds the demo site

## Notes

- Root `package.json` `files: ["dist"]` already excludes `site/` from npm publishes
- The site import changes from relative (`../src`) to package name (`og-crd`), which is a better test of the actual published API surface
