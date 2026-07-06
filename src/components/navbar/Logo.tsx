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

  if (!mounted) {
    return (
      <Image
        src="/light_logo.png"
        width={56}
        height={30}
        loading="eager"
        alt="Ghassan Logo"
      />
    )
  }

  return (
    <Image
      src={
        resolvedTheme === "dark"
          ? "/dark_logo.png"
          : "/light_logo.png"
      }
      loading="eager"
      objectFit=""
      width={56}
      height={32}
      alt="Ghassan Logo"
    />
  )
}