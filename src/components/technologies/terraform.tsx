import React from "react"
import { cn } from "@/lib/utils"

export default function Terraform({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      className={cn("h-10 w-10 md:h-14 md:w-14", className)}
      viewBox="0 0 48 48"
    >
      <polygon className="dark:invert" points="17,23 5,16 5,2 17,9"></polygon>
      <polygon
        className="dark:invert"
        points="31,31 19,24 19,10 31,17"
      ></polygon>
      <polygon
        className="fill-foreground/70"
        points="33,31 45,24 45,10 33,17"
      ></polygon>
      <polygon
        className="dark:invert"
        points="31,47 19,40 19,26 31,33"
      ></polygon>
    </svg>
  )
}
