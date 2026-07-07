"use client"

import * as React from "react"
import { BadgeCheck, BookmarkIcon } from "lucide-react"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"

export function TechBadge() {
  const t = useTranslations("hero")
  const badge = t.raw("badge") as string[]
  return (
    <div className="flex w-full flex-wrap justify-center gap-2 lg:justify-start">
      {badge.map((item, index) => (
        <Badge key={index}>{item}</Badge>
      ))}
    </div>
  )
}
