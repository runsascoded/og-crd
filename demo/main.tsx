import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { OgCardFromUrl, CardRow } from "../src"

const PROXY = "https://corsproxy.io/?"

const apps = [
  "https://github.com/runsascoded/img-voronoi",
  "https://github.com/hudcostreets/nj-crashes",
  "https://github.com/HackJerseyCity/jc-taxes",
  "https://github.com/hudcostreets/path",
  "https://github.com/hudcostreets/hudson-transit",
  "https://github.com/runsascoded/apvd",
]

function App() {
  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ color: "#fff", marginBottom: "0.5rem" }}>og-crd</h1>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <a href="https://github.com/runsascoded/og-crd" title="GitHub" style={{ color: "#ccc", display: "flex", alignItems: "center" }}>
            <svg height="22" width="22" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
          <a href="https://www.npmjs.com/package/og-crd" title="npm" style={{ display: "flex", alignItems: "center" }}>
            <img src="https://static-production.npmjs.com/58a19602036db1daee0d7863c94673a4.png" alt="npm" height="22" />
          </a>
        </div>
        <p style={{ color: "#999", marginBottom: "0.5rem" }}>
          OG meta preview cards for <b style={{ color: "#ccc" }}>web</b> and <b style={{ color: "#ccc" }}>markdown</b>.
        </p>
        <p style={{ color: "#999", marginBottom: "2rem" }}>
          The React components below render live OG cards with hover effects and automatic GitHub cleanup.
          The same library includes a <a href="https://github.com/runsascoded/og-crd#og-card-md--github-compatible-markdown-cards" style={{ color: "#7eb8da" }}>CLI for generating static cards</a> that render in GitHub READMEs.
          {" "}Install: <code style={{ color: "#ccc" }}>pnpm add og-crd</code>
        </p>

        <h2 style={{ color: "#ccc" }}>Single card</h2>
        <div style={{ maxWidth: 400, marginBottom: "2rem" }}>
          <OgCardFromUrl url={apps[0]} proxy={PROXY} />
        </div>

        <h2 style={{ color: "#ccc" }}>Two-card row</h2>
        <CardRow gap="1rem">
          {apps.slice(0, 2).map(url =>
            <div key={url} style={{ width: 400 }}>
              <OgCardFromUrl url={url} proxy={PROXY} />
            </div>
          )}
        </CardRow>

        <h2 style={{ color: "#ccc", marginTop: "2rem" }}>Grid</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {apps.map(url =>
            <OgCardFromUrl key={url} url={url} proxy={PROXY} />
          )}
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
