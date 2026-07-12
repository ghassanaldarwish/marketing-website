import Logo from "./Logo"
import ModeToggle from "./ModeToggle"
import { FloatingNav } from "../ui/FloatingNav"
import { LinkType } from "@/lib/types"

import LanguageToggle from "./LanguageToggle"
import MobileMenu from "./MobileMenu"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { buttonVariants } from "../ui/button"
import { Suspense } from "react"
export default function Navbar() {
  const t = useTranslations("navbar")
  const navItems = t.raw("pages") as LinkType[]
  return (
    <nav className="w-screen">
      <FloatingNav className="fixed top-0 z-50 flex h-10 w-full max-w-6xl items-center justify-between bg-background/50 px-2 backdrop-blur-md lg:top-2 lg:left-1/2 lg:m-auto lg:h-12 lg:-translate-x-1/2 lg:rounded-xl">
        <Link href="/" className="flex gap-4">
          <Logo />
          <span className="hidden text-xl font-bold lg:block">Ghassan</span>
        </Link>

        <div className="hidden w-1/2 justify-center gap-6 capitalize lg:flex">
          {navItems.map((i, idx) =>
            i.disabled ? (
              <div
                key={idx}

                style={{
                  textDecoration: "none",
                }}

                className={cn(
                  "hover cursor-not-allowed text-center opacity-30",
                  buttonVariants({
                    variant: "link",
                  })
                )}
              >
                {i.title}
              </div>
            ) : (
              <Link
                key={idx}

                className={cn(
                  "text-center",
                  buttonVariants({
                    variant: "link",
                  })
                )}
                href={i.url}
              >
                {i.title}
              </Link>
            )
          )}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <ModeToggle />
          <Suspense fallback={<LanguageToggleFallback />}>
            <LanguageToggle />
          </Suspense>
        </div>

        <MobileMenu />
      </FloatingNav>
    </nav>
  )
}

function LanguageToggleFallback() {
  return (
    <div
      className="h-9 w-9 animate-pulse rounded-md border bg-muted"
      aria-hidden="true"
    />
  )
}
