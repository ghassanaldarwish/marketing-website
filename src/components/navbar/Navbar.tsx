import Logo from "./Logo"
import ModeToggle from "./ModeToggle"
import { FloatingNav } from "./FloatingNav"
import { NavbarPagesType } from "@/lib/types"
import { useTranslations } from "next-intl"
import LanguageToggle from "./LanguageToggle"

export default function Navbar() {
  const t = useTranslations("navbar")
  const navItems = t.raw("pages") as NavbarPagesType[]
  return (
    <nav className="w-screen">
      <FloatingNav className="fixed top-2 left-1/2 z-50 m-auto flex h-(--navbar-height) w-full max-w-6xl -translate-x-1/2 items-center justify-between rounded-xl bg-background/50 px-2 backdrop-blur-md">
        <Logo />

        <ul className="flex w-1/2 justify-center gap-10">
          {navItems.map((i, idx) => (
            <i key={idx} className="text-center">
              {i.title}
            </i>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <LanguageToggle />
        </div>
      </FloatingNav>
    </nav>
  )
}
