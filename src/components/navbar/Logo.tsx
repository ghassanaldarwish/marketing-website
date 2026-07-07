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
        className="w-16 lg:w-20"
        src="/light_logo_500_180.png"
        width={153}
        height={55}
        loading="eager"
        alt="Ghassan Logo"
      />
    )
  }

  return (
    <Image
      className="w-16 lg:w-20"
      src={
        resolvedTheme === "dark"
          ? "/dark_logo_500_180.png"
          : "/light_logo_500_180.png"
      }
      loading="eager"
      objectFit=""
      width={153}
      height={55}
      alt="Ghassan Logo"
    />
  )
}
