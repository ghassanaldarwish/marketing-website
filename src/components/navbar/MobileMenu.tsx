"use client"
// import { Link } from "@/navigation"
// import navbarData from "./data"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"
import { NavbarPagesType } from "@/lib/types"
import { useTranslations } from "next-intl"
import LanguageToggle from "./LanguageToggle"
import ModeToggle from "./ModeToggle"
import Link from "next/link"
// type NavItem = {
//   name: string
//   href: string
// }

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("navbar")
  const navItems = t.raw("pages") as NavbarPagesType[]
  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col gap-4">
            {navItems.map((item, idx) => (
              <Link
                onClick={() => setIsOpen(false)}
                className="hover:underline"
                key={idx}
                href={item.url}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileMenu
