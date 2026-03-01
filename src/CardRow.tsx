import { CSSProperties, FC } from "react"
import { CardRowProps } from "./types"

export const CardRow: FC<CardRowProps> = ({
  children,
  className,
  gap = "1rem",
}) => {
  const style = { gap } as CSSProperties
  const classes = ["og-card-row", className].filter(Boolean).join(" ")
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}
