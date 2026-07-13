import { Suspense } from "react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { navigationConfig } from "@/lib/config/navigation"
import { FloatingNav } from "@/components/ui/FloatingNav"

import DesktopNavigation from "@/components/navbar/DesktopNavigation"
import MobileMenu from "@/components/navbar/MobileMenu"

import LanguageToggle from "./LanguageToggle"
import ModeToggle from "./ModeToggle"
import Logo from "./Logo"
import { NavigationItem } from "@/lib/types"

export default function Navbar() {
  const t = useTranslations("navbar")

  const navigationItems: NavigationItem[] = navigationConfig.map((item) => ({
    id: item.id,
    href: item.href,
    disabled: item.disabled,
    title: t(`pages.${item.id}`),
  }))

  const navigationLabels = {
    desktopNavigation: t("desktopNavigationLabel"),
    mobileNavigation: t("mobileNavigationLabel"),
    openMenu: t("openMenu"),
    closeMenu: t("closeMenu"),
    brandLink: t("brandLinkLabel"),
    disabled: t("disabledLabel"),
  }

  return (
    <nav aria-label={navigationLabels.desktopNavigation} className="w-full">
      <FloatingNav className="fixed top-0 z-50 flex h-10 w-full max-w-6xl items-center justify-between bg-background/50 px-2 backdrop-blur-md lg:top-2 lg:left-1/2 lg:h-12 lg:-translate-x-1/2 lg:rounded-xl">
        <Link
          href="/"
          aria-label={navigationLabels.brandLink}
          className="flex items-center gap-4"
        >
          <Logo />

          <span className="hidden text-xl font-bold lg:block">Ghassan</span>
        </Link>

        <DesktopNavigation
          items={navigationItems}
          ariaLabel={navigationLabels.desktopNavigation}
          disabledLabel={navigationLabels.disabled}
        />

        <div className="hidden items-center gap-2 lg:flex">
          <ModeToggle />

          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>
        </div>

        <MobileMenu
          items={navigationItems}
          navigationLabel={navigationLabels.mobileNavigation}
          openMenuLabel={navigationLabels.openMenu}
          closeMenuLabel={navigationLabels.closeMenu}
          brandLinkLabel={navigationLabels.brandLink}
          disabledLabel={navigationLabels.disabled}
        />
      </FloatingNav>
    </nav>
  )
}
