import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { OgCard, OgCardFromUrl, CardRow } from "../src"

const PROXY = "https://corsproxy.io/?"

function App() {
  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: "#fff", marginBottom: "2rem" }}>@rdub/og-card demo</h1>

        <h2 style={{ color: "#ccc" }}>Static card with thumbnail</h2>
        <div style={{ maxWidth: 360, marginBottom: "2rem" }}>
          <OgCard
            title="Mountain Lake"
            description="A scenic mountain lake at dawn"
            thumbnail="https://picsum.photos/seed/og-card-1/800/418"
            href="https://picsum.photos"
          />
        </div>

        <h2 style={{ color: "#ccc" }}>Placeholder card (no thumbnail)</h2>
        <div style={{ maxWidth: 360, marginBottom: "2rem" }}>
          <OgCard title="No Image Available" />
        </div>

        <h2 style={{ color: "#ccc" }}>OgCardFromUrl</h2>
        <div style={{ maxWidth: 360, marginBottom: "2rem" }}>
          <OgCardFromUrl
            url="https://github.com/runsascoded/og-card"
            proxy={PROXY}
          />
        </div>

        <h2 style={{ color: "#ccc" }}>CardRow</h2>
        <CardRow>
          <div style={{ width: 280 }}>
            <OgCard
              title="Forest Path"
              thumbnail="https://picsum.photos/seed/og-card-2/800/418"
            />
          </div>
          <div style={{ width: 280 }}>
            <OgCard
              title="City Skyline"
              description="Urban views at sunset"
              thumbnail="https://picsum.photos/seed/og-card-3/800/418"
            />
          </div>
          <div style={{ width: 280 }}>
            <OgCard title="Placeholder" />
          </div>
          <div style={{ width: 280 }}>
            <OgCard
              title="Ocean Waves"
              thumbnail="https://picsum.photos/seed/og-card-4/800/418"
              hoverEffect="shadow"
            />
          </div>
        </CardRow>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
