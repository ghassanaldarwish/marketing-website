/* eslint-disable react-hooks/refs */
"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type EncryptedTextProps = {
  text: string
  className?: string
  /** Time in milliseconds between revealing each subsequent real character. */
  revealDelayMs?: number
  /** Optional custom character set to use for the gibberish effect. */
  charset?: string
  /** Time in milliseconds between gibberish flips. */
  flipDelayMs?: number
  encryptedClassName?: string
  revealedClassName?: string
}

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?"

function generateRandomCharacter(charset: string): string {
  const index = Math.floor(Math.random() * charset.length)
  return charset.charAt(index)
}

function generateGibberishPreservingSpaces(
  original: string,
  charset: string
): string {
  if (!original) return ""

  let result = ""

  for (let index = 0; index < original.length; index += 1) {
    const character = original[index]
    result += character === " " ? " " : generateRandomCharacter(charset)
  }

  return result
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
}) => {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  const [revealCount, setRevealCount] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const lastFlipTimeRef = useRef(0)
  const scrambleCharsRef = useRef<string[]>(Array(text.length).fill(" "))

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return

    const initial = text ? generateGibberishPreservingSpaces(text, charset) : ""
    scrambleCharsRef.current = initial.split("")
    startTimeRef.current = performance.now()
    lastFlipTimeRef.current = startTimeRef.current

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevealCount(0)

    let isCancelled = false

    const update = (now: number) => {
      if (isCancelled) return

      const totalLength = text.length
      const elapsedMs = now - startTimeRef.current
      const currentRevealCount = Math.min(
        totalLength,
        Math.floor(elapsedMs / Math.max(1, revealDelayMs))
      )

      setRevealCount(currentRevealCount)

      if (currentRevealCount >= totalLength) return

      if (now - lastFlipTimeRef.current >= Math.max(0, flipDelayMs)) {
        for (let index = currentRevealCount; index < totalLength; index += 1) {
          scrambleCharsRef.current[index] =
            text[index] === " " ? " " : generateRandomCharacter(charset)
        }

        lastFlipTimeRef.current = now
      }

      animationFrameRef.current = requestAnimationFrame(update)
    }

    animationFrameRef.current = requestAnimationFrame(update)

    return () => {
      isCancelled = true

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    charset,
    flipDelayMs,
    isInView,
    prefersReducedMotion,
    revealDelayMs,
    text,
  ])

  if (!text) return null

  if (prefersReducedMotion) {
    return (
      <span ref={ref} className={cn(className)}>
        {text}
      </span>
    )
  }

  return (
    <motion.span
      ref={ref}
      className={cn(className)}
      aria-label={text}
      role="text"
    >
      {text.split("").map((character, index) => {
        const isRevealed = index < revealCount
        const displayCharacter = isRevealed
          ? character
          : character === " "
            ? " "
            : (scrambleCharsRef.current[index] ??
              generateRandomCharacter(charset))

        return (
          <span
            key={`${index}-${character}`}
            aria-hidden="true"
            className={cn(isRevealed ? revealedClassName : encryptedClassName)}
          >
            {displayCharacter}
          </span>
        )
      })}
    </motion.span>
  )
}
