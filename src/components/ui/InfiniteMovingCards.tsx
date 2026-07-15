"use client"

import type { CSSProperties, ReactNode } from "react"

import { useLocale } from "next-intl"
import { useReducedMotion } from "motion/react"

import { getTextDirection, isAppLocale } from "@/i18n/locale"
import { cn } from "@/lib/utils"

type InfiniteMovingCardsProps = {
  children: ReactNode
  direction?: "left" | "right"
  speed?: "fast" | "normal" | "slow"
  pauseOnHover?: boolean
  animated?: boolean
  className?: string
}

type ScrollerStyle = CSSProperties & {
  "--animation-direction": "forwards" | "reverse"
  "--animation-duration": string
}

const animationDurationBySpeed: Record<
  NonNullable<InfiniteMovingCardsProps["speed"]>,
  string
> = {
  fast: "20s",
  normal: "40s",
  slow: "80s",
}

export default function InfiniteMovingCards({
  children,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  animated = true,
  className,
}: InfiniteMovingCardsProps) {
  const locale = useLocale()
  const prefersReducedMotion = useReducedMotion()
  const textDirection = isAppLocale(locale) ? getTextDirection(locale) : "ltr"
  const shouldAnimate = animated && !prefersReducedMotion

  const scrollerStyle: ScrollerStyle = {
    "--animation-direction": direction === "left" ? "forwards" : "reverse",
    "--animation-duration": animationDurationBySpeed[speed],
  }

  const listClassName = "flex shrink-0 flex-nowrap items-center gap-8 py-4"

  return (
    <div
      className={cn(
        "scroller relative z-20 m-auto max-w-6xl overflow-hidden",
        shouldAnimate &&
          "[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
      style={scrollerStyle}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 flex-nowrap items-center gap-8",
          shouldAnimate && "w-max",
          shouldAnimate &&
            (textDirection === "rtl" ? "animate-scroll-rtl" : "animate-scroll"),
          shouldAnimate && pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        <ul className={listClassName}>{children}</ul>

        {shouldAnimate && (
          <ul aria-hidden="true" className={listClassName}>
            {children}
          </ul>
        )}
      </div>
    </div>
  )
}
