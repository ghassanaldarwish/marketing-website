"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

import {
  createTerminalLines,
  type TerminalLine,
} from "./terminal-content"

function useInView(ref: React.RefObject<HTMLElement | null>, once = true) {
  const [inView, setInView] = useState(false)
  const triggered = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || (once && triggered.current)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          setInView(true)

          if (once) {
            triggered.current = true
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once, ref])

  return inView
}

type TokenType =
  | "command"
  | "flag"
  | "string"
  | "number"
  | "operator"
  | "path"
  | "variable"
  | "comment"
  | "default"

type Token = {
  type: TokenType
  value: string
}

function tokenizeBash(text: string): Token[] {
  const tokens: Token[] = []
  const words = text.split(/(\s+)/)
  let isFirstWord = true

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      tokens.push({ type: "default", value: word })
      continue
    }

    if (word.startsWith("#")) {
      tokens.push({ type: "comment", value: word })
      continue
    }

    if (word.startsWith("$")) {
      tokens.push({ type: "variable", value: word })
      isFirstWord = false
      continue

    }

    if (word.startsWith("--") || word.startsWith("-")) {
      tokens.push({ type: "flag", value: word })
      isFirstWord = false
      continue
    }

    if (/^["'].*["']$/.test(word)) {
      tokens.push({ type: "string", value: word })
      isFirstWord = false
      continue
    }

    if (/^\d+$/.test(word)) {
      tokens.push({ type: "number", value: word })
      isFirstWord = false
      continue
    }

    if (/^[|>&<]+$/.test(word)) {
      tokens.push({ type: "operator", value: word })
      isFirstWord = true
      continue
    }

    if (word.includes("/") || word.startsWith(".") || word.startsWith("~")) {
      tokens.push({ type: "path", value: word })
      isFirstWord = false
      continue
    }

    if (isFirstWord) {
      tokens.push({ type: "command", value: word })
      isFirstWord = false
      continue
    }

    tokens.push({ type: "default", value: word })
  }

  return tokens
}

const tokenColors: Record<TokenType, string> = {
  command: "text-emerald-400",
  flag: "text-sky-400",
  string: "text-amber-300",
  number: "text-purple-400",
  operator: "text-red-400",
  path: "text-cyan-300",
  variable: "text-pink-400",
  comment: "text-neutral-500",
  default: "dark:text-neutral-300 text-muted-foreground/90",
}

function SyntaxHighlightedText({ text }: { text: string }) {
  const tokens = tokenizeBash(text)

  return (
    <>
      {tokens.map((token, index) => (
        <span key={`${index}-${token.value}`} className={tokenColors[token.type]}>
          {token.value}
        </span>
      ))}
    </>
  )
}

export type TerminalProps = {
  commands: string[]
  outputs?: Record<number, string[]>
  username?: string
  className?: string
  typingSpeed?: number
  delayBetweenCommands?: number
  initialDelay?: number
  enableSound?: boolean
}

export function Terminal({
  commands = ["npx shadcn@latest init"],
  outputs = {},
  username = "Ghassans-Macbook",
  className,
  typingSpeed = 50,
  delayBetweenCommands = 800,
  initialDelay = 500,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef)
  const prefersReducedMotion = useReducedMotion()

  const staticLines = useMemo(
    () => createTerminalLines(commands, outputs),
    [commands, outputs]
  )

  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentText, setCurrentText] = useState("")
  const [commandIndex, setCommandIndex] = useState(0)
  const [characterIndex, setCharacterIndex] = useState(0)
  const [outputIndex, setOutputIndex] = useState(-1)
  const [phase, setPhase] = useState<
    "idle" | "typing" | "executing" | "outputting" | "pausing" | "done"
  >("idle")
  const [cursorVisible, setCursorVisible] = useState(true)

  const currentCommand = commands[commandIndex] ?? ""
  const currentOutputs = useMemo(
    () => outputs[commandIndex] ?? [],
    [commandIndex, outputs]
  )
  const isLastCommand = commandIndex === commands.length - 1

  useEffect(() => {
    if (prefersReducedMotion || !inView || phase !== "idle") return

    const timeout = setTimeout(() => setPhase("typing"), initialDelay)
    return () => clearTimeout(timeout)
  }, [inView, initialDelay, phase, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion || phase !== "typing") return

    if (characterIndex < currentCommand.length) {
      const timeout = setTimeout(() => {
        setCurrentText(currentCommand.slice(0, characterIndex + 1))
        setCharacterIndex((current) => current + 1)
      }, typingSpeed + Math.random() * 30)

      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(() => setPhase("executing"), 80)
    return () => clearTimeout(timeout)
  }, [
    characterIndex,
    currentCommand,
    phase,
    prefersReducedMotion,
    typingSpeed,
  ])

  useEffect(() => {
    if (prefersReducedMotion || phase !== "executing") return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines((previous) => [
      ...previous,
      { type: "command", content: currentCommand },
    ])
    setCurrentText("")

    if (currentOutputs.length > 0) {
      setOutputIndex(0)
      setPhase("outputting")
    } else if (isLastCommand) {
      setPhase("done")
    } else {
      setPhase("pausing")
    }
  }, [
    currentCommand,
    currentOutputs.length,
    isLastCommand,
    phase,
    prefersReducedMotion,
  ])

  useEffect(() => {
    if (prefersReducedMotion || phase !== "outputting") return

    if (outputIndex >= 0 && outputIndex < currentOutputs.length) {
      const timeout = setTimeout(() => {
        setLines((previous) => [
          ...previous,
          { type: "output", content: currentOutputs[outputIndex] },
        ])
        setOutputIndex((current) => current + 1)
      }, 150)

      return () => clearTimeout(timeout)
    }

    if (outputIndex >= currentOutputs.length) {
      const timeout = setTimeout(() => {
        setPhase(isLastCommand ? "done" : "pausing")
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [
    currentOutputs,
    isLastCommand,
    outputIndex,
    phase,
    prefersReducedMotion,
  ])

  useEffect(() => {
    if (prefersReducedMotion || phase !== "pausing") return

    const timeout = setTimeout(() => {
      setCharacterIndex(0)
      setOutputIndex(-1)
      setCommandIndex((current) => current + 1)
      setPhase("typing")
    }, delayBetweenCommands)

    return () => clearTimeout(timeout)
  }, [delayBetweenCommands, phase, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setCursorVisible((current) => !current)
    }, 530)

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!prefersReducedMotion && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [lines, phase, prefersReducedMotion])

  const visibleLines = prefersReducedMotion ? staticLines : lines

  const prompt = (
    <span className="text-neutral-500">
      <span className="text-sky-500">{username}</span>
      <span className="text-emerald-600">:</span>
      <span className="text-sky-400">~</span>
      <span className="text-neutral-500">$</span>{" "}
    </span>
  )

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full font-mono text-xs", className)}
    >
      <div className="h-full overflow-hidden rounded-lg border bg-background/60 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2 border-b bg-background px-4 py-3 dark:bg-neutral-800">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>

          <div className="flex-1 text-center">
            <span className="truncate text-xs text-foreground/70 dark:text-neutral-400">
              {username} — bash
            </span>
          </div>

          <div aria-hidden="true" className="w-[52px]" />
        </div>

        <div
          ref={contentRef}
          className="no-visible-scrollbar overflow-y-auto p-4 font-mono"
        >
          {visibleLines.map((line, index) => (
            <div
              key={`${line.type}-${index}-${line.content}`}
              className="leading-relaxed whitespace-pre-wrap"
            >
              {line.type === "command" ? (
                <span>
                  {prompt}
                  <SyntaxHighlightedText text={line.content} />
                </span>
              ) : (
                <span className="text-secondary-foreground/60 dark:text-neutral-400">
                  {line.content}
                </span>
              )}
            </div>
          ))}

          {!prefersReducedMotion && phase === "typing" && (
            <div className="leading-relaxed whitespace-pre-wrap">
              {prompt}
              <SyntaxHighlightedText text={currentText} />
              <span className="ml-0.5 inline-block h-4 w-2 bg-accent-foreground/70 align-middle dark:bg-neutral-300" />
            </div>
          )}

          {!prefersReducedMotion &&
            (phase === "done" ||
              phase === "pausing" ||
              phase === "outputting") && (
              <div className="leading-relaxed whitespace-pre-wrap">
                {prompt}
                <span
                  className={cn(
                    "inline-block h-4 w-2 bg-accent-foreground/80 align-middle transition-opacity duration-100 dark:bg-neutral-300",
                    !cursorVisible && "opacity-0"
                  )}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
