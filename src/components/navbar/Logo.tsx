"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const source =
    mounted && resolvedTheme === "dark"
      ? "/dark_logo_500_180.png"
      : "/light_logo_500_180.png"

  return (
    <Image
      src={source}
      width={153}
      height={55}
      alt="Ghassan Aldarwish"
      loading="eager"
      priority
      className="h-auto w-16 object-contain lg:w-20"
    />
  )
}
