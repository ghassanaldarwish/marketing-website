import Logo from "./Logo"
import ModeToggle from "./ModeToggle"
import { FloatingNav } from "./FloatingNav"
import { NavbarPagesType } from "@/lib/types"

import LanguageToggle from "./LanguageToggle"
import MobileMenu from "./MobileMenu"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
export default function Navbar() {
  const t = useTranslations("navbar")
  const navItems = t.raw("pages") as NavbarPagesType[]
  return (
    <nav className="w-screen">
      <FloatingNav className="fixed top-0 z-50 flex h-10 w-full max-w-6xl items-center justify-between bg-background/50 px-2 backdrop-blur-md lg:top-2 lg:left-1/2 lg:m-auto lg:h-12 lg:-translate-x-1/2 lg:rounded-xl">
        <Link href="/" className="">
          <Logo />
        </Link>

        <div className="hidden w-1/2 justify-center gap-6 lg:flex">
          {navItems.map((i, idx) => (
            <Link key={idx} className="text-center" href={i.url}>
              {i.title}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <ModeToggle />
          <LanguageToggle />
        </div>

        <MobileMenu />
      </FloatingNav>
    </nav>
  )
}
