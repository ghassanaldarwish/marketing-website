"use client"

import type { ReactNode } from "react"
import { useState } from "react"

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react"

import { cn } from "@/lib/utils"

export const FloatingNav = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const { scrollY } = useScroll()
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)

  useMotionValueEvent(scrollY, "change", (current) => {
    if (prefersReducedMotion) return

    const previous = scrollY.getPrevious()

    if (previous === undefined) return

    if (current < 50) {
      setVisible(true)
      return
    }

    setVisible(current < previous)
  })

  const isVisible = prefersReducedMotion || visible

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 1, y: -100 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
