import { CSSProperties, FC } from "react"
import { cleanGitHubDescription, cleanGitHubTitle } from "./core"
import { OgCard } from "./OgCard"
import { OgCardFromUrlProps } from "./types"
import { useOgMeta } from "./useOgMeta"

export const OgCardFromUrl: FC<OgCardFromUrlProps> = ({
  url,
  proxy,
  title,
  description,
  thumbnail,
  icons,
  className,
  aspectRatio = 1.91,
  hoverEffect = "both",
}) => {
  const { data, loading } = useOgMeta(url, proxy)

  if (loading) {
    const style = { "--og-card-ar": aspectRatio } as CSSProperties
    return (
      <div className={["og-card", "og-card-skeleton", className].filter(Boolean).join(" ")}>
        <div className="og-card-link" style={style}>
          <div className="og-card-inner" />
        </div>
      </div>
    )
  }

  const parsed = new URL(url)
  const hostname = parsed.hostname.replace(/^www\./, "")
  const isGitHub = /^(www\.)?github\.com$/.test(parsed.hostname)

  let resolvedTitle = title ?? data?.title ?? hostname
  let resolvedDesc = description ?? data?.description
  if (isGitHub) {
    resolvedTitle = title ?? cleanGitHubTitle(data?.title ?? hostname, url)
    resolvedDesc = description ?? (data?.description ? cleanGitHubDescription(data.description) : undefined)
  }

  return (
    <OgCard
      thumbnail={thumbnail ?? data?.image}
      title={resolvedTitle}
      description={resolvedDesc}
      icons={icons}
      href={url}
      className={className}
      aspectRatio={aspectRatio}
      hoverEffect={hoverEffect}
    />
  )
}
