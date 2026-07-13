"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ModeToggle() {
  const { setTheme } = useTheme()
  const t = useTranslations("navbar.theme")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("toggle")}
        >
          <Sun
            aria-hidden="true"
            className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />

          <Moon
            aria-hidden="true"
            className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />

          <span className="sr-only">{t("toggle")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          {t("light")}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          {t("dark")}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setTheme("system")}>
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
