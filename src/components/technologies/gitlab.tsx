import React from "react"
import { cn } from "@/lib/utils"

export default function Gitlab({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      className={cn("h-10 w-10 md:h-14 md:w-14", className)}
      viewBox="0 0 48 48"
    >
      <path className="dark:invert" d="M24 43L16 20 32 20z"></path>
      <path className="fill-foreground/70" d="M24 43L42 20 32 20z"></path>
      <path className="dark:invert" d="M37 5L42 20 32 20z"></path>
      <path className="fill-foreground/50" d="M24 43L42 20 45 28z"></path>
      <path className="fill-foreground/70" d="M24 43L6 20 16 20z"></path>
      <path className="dark:invert" d="M11 5L6 20 16 20z"></path>
      <path className="fill-foreground/50" d="M24 43L6 20 3 28z"></path>
    </svg>
  )
}
