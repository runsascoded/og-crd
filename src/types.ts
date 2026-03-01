import { ReactNode } from "react"

export interface OgCardProps {
  thumbnail?: string | ReactNode
  title: string
  description?: string
  icons?: ReactNode[]
  href?: string
  className?: string
  aspectRatio?: number
  hoverEffect?: "scale" | "shadow" | "both" | "none"
}

export type ProxyFn = (url: string) => string

export interface OgCardFromUrlProps {
  url: string
  proxy?: string | ProxyFn
  icons?: ReactNode[]
  className?: string
  aspectRatio?: number
  hoverEffect?: "scale" | "shadow" | "both" | "none"
  title?: string
  description?: string
  thumbnail?: string | ReactNode
}

export interface CardRowProps {
  children: ReactNode
  className?: string
  gap?: number | string
}

export interface OgMeta {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
}
