import Logo from "./Logo"
import ModeToggle from "./ModeToggle"
import { FloatingNav } from "./FloatingNav"
import { NavbarPagesType } from "@/lib/types"
import { useTranslations } from "next-intl"
import LanguageToggle from "./LanguageToggle"
import MobileMenu from "./MobileMenu"

export default function Navbar() {
  const t = useTranslations("navbar")
  const navItems = t.raw("pages") as NavbarPagesType[]
  return (
    <nav className="w-screen">
      <FloatingNav className="fixed top-0 z-50 flex h-10 w-full max-w-6xl items-center justify-between bg-background/50 px-2 backdrop-blur-md lg:top-2 lg:left-1/2 lg:m-auto lg:h-12 lg:-translate-x-1/2 lg:rounded-xl">
        <Logo />

        <ul className="hidden w-1/2 justify-center gap-6 lg:flex">
          {navItems.map((i, idx) => (
            <i key={idx} className="text-center">
              {i.title}
            </i>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <ModeToggle />
          <LanguageToggle />
        </div>

        <MobileMenu />
      </FloatingNav>
    </nav>
  )
}
