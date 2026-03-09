import { ReactNode } from 'react';
import { ProxyFn } from './core';
export type { OgMeta, ProxyFn } from './core';
export interface OgCardProps {
    thumbnail?: string | ReactNode;
    title: string;
    description?: string;
    icons?: ReactNode[];
    href?: string;
    className?: string;
    aspectRatio?: number;
    hoverEffect?: "scale" | "shadow" | "both" | "none";
}
export interface OgCardFromUrlProps {
    url: string;
    proxy?: string | ProxyFn;
    icons?: ReactNode[];
    className?: string;
    aspectRatio?: number;
    hoverEffect?: "scale" | "shadow" | "both" | "none";
    title?: string;
    description?: string;
    thumbnail?: string | ReactNode;
}
export interface CardRowProps {
    children: ReactNode;
    className?: string;
    gap?: number | string;
}
