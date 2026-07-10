"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"

export function TechBadge() {
  const t = useTranslations("hero")
  const badge = t.raw("badge") as string[]
  return (
    <div className="flex w-full flex-wrap gap-2">
      {badge.map((item, index) => (
        <Badge
          className="bg-background p-2 lg:p-4 lg:text-lg"
          variant="outline"
          key={index}
        >
          {item}
        </Badge>
      ))}
    </div>
  )
}
