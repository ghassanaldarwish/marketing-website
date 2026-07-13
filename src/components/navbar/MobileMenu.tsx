"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

import { Link } from "@/i18n/routing"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import LanguageToggle from "@/components/navbar/LanguageToggle"
import ModeToggle from "@/components/navbar/ModeToggle"
import Logo from "@/components/navbar/Logo"
import { NavigationItem } from "@/lib/types"

type MobileMenuProps = {
  items: NavigationItem[]
  navigationLabel: string
  openMenuLabel: string
  closeMenuLabel: string
  brandLinkLabel: string
  disabledLabel: string
}

export default function MobileMenu({
  items,
  navigationLabel,
  openMenuLabel,
  closeMenuLabel,
  brandLinkLabel,
  disabledLabel,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={openMenuLabel}
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          showCloseButton={false}
          aria-label={navigationLabel}
          className="flex flex-col"
        >
          <SheetTitle className="sr-only">{navigationLabel}</SheetTitle>

          <div className="flex h-full flex-col justify-between gap-6 px-4">
            <div className="flex h-14 items-center justify-between">
              <Link
                href="/"
                aria-label={brandLinkLabel}
                onNavigate={closeMenu}
                className="inline-flex"
              >
                <Logo />
              </Link>

              <SheetClose asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={closeMenuLabel}
                >
                  <X aria-hidden="true" className="size-5" />
                </Button>
              </SheetClose>
            </div>

            <nav aria-label={navigationLabel}>
              <ul className="flex flex-col items-center gap-4">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.disabled ? (
                      <span
                        aria-disabled="true"
                        className={cn(
                          buttonVariants({
                            variant: "link",
                          }),
                          "cursor-not-allowed text-xl capitalize opacity-40"
                        )}
                      >
                        {item.title}

                        <span className="sr-only"> ({disabledLabel})</span>
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        onNavigate={closeMenu}
                        className={cn(
                          buttonVariants({
                            variant: "link",
                          }),
                          "text-xl capitalize"
                        )}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex h-14 items-center justify-between gap-2">
              <ModeToggle />
              <LanguageToggle onNavigate={closeMenu} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
