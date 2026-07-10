import React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function Hermes({ className }: { className?: string }) {
  return (
    <Image
      src="/hermes_light_logo.png"
      width={50}
      height={50}
      className={cn(
        "h-10 w-10 scale-100 object-contain md:h-14 md:w-14 md:scale-150 dark:invert",
        className
      )}
      alt="hermes"
      loading="eager"
    />
  )
}
