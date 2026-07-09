"use client"
import React, { useState } from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react"
import { cn } from "@/lib/utils"

export const FloatingNav = ({
  children,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
  className?: string
}) => {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(true)

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious()

    if (previous === undefined) return

    if (current < 50) {
      setVisible(true)
      return
    }

    setVisible(current < previous)
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
