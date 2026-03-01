import { CSSProperties, FC } from "react"
import { OgCardProps } from "./types"

const hoverClass = (effect: OgCardProps["hoverEffect"] = "both") =>
  effect === "none" ? "" : `hover-${effect}`

export const OgCard: FC<OgCardProps> = ({
  thumbnail,
  title,
  description,
  icons,
  href,
  className,
  aspectRatio = 1.91,
  hoverEffect = "both",
}) => {
  const style = { "--og-card-ar": aspectRatio } as CSSProperties
  const hasThumbnail = !!thumbnail
  const inner = (
    <div className="og-card-inner">
      {hasThumbnail ? (
        <div className="og-card-thumbnail">
          {typeof thumbnail === "string"
            ? <img src={thumbnail} alt={title} loading="lazy" />
            : thumbnail
          }
        </div>
      ) : (
        <div className="og-card-placeholder">
          <span className="og-card-placeholder-title">{title}</span>
        </div>
      )}
      {hasThumbnail && (
        <div className="og-card-overlay">
          <h3 className="og-card-title">{title}</h3>
          {description && <p className="og-card-description">{description}</p>}
          {icons && icons.length > 0 && (
            <div className="og-card-icons">{icons}</div>
          )}
        </div>
      )}
    </div>
  )

  const classes = ["og-card", hoverClass(hoverEffect), className].filter(Boolean).join(" ")

  return (
    <div className={classes}>
      {href ? (
        <a className="og-card-link" href={href} target="_blank" rel="noopener noreferrer" style={style}>
          {inner}
        </a>
      ) : (
        <div className="og-card-link" style={style}>
          {inner}
        </div>
      )}
    </div>
  )
}
