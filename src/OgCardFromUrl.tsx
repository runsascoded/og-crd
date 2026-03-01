import { CSSProperties, FC } from "react"
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

  const hostname = new URL(url).hostname.replace(/^www\./, "")

  return (
    <OgCard
      thumbnail={thumbnail ?? data?.image}
      title={title ?? data?.title ?? hostname}
      description={description ?? data?.description}
      icons={icons}
      href={url}
      className={className}
      aspectRatio={aspectRatio}
      hoverEffect={hoverEffect}
    />
  )
}
