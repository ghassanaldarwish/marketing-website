import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Logo from "../navbar/Logo"
import { LinkType } from "@/lib/types"
import { buttonVariants } from "../ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "../ui/icons"

export default function Footer() {
  const tFooter = useTranslations("footer")
  const tNavbar = useTranslations("navbar")
  const t = useTranslations()
  const name = t("name")
  const copyright = tFooter("copyright")
  const navItems = tNavbar.raw("pages") as LinkType[]
  const socialTitle = tFooter("social.title")
  const socialLinks = tFooter.raw("social.links") as LinkType[]

  return (
    <div className="border-t bg-background px-2 py-8">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-8 lg:flex-row">
        <div>
          <div className="md:flex">
            <Link className="flex gap-4 text-2xl font-bold" href="/">
              <Logo />
              <h1 className="capitalize">{name}</h1>
            </Link>
          </div>
          <div className="mt-2">
            <p>{copyright}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <div className="flex flex-col justify-center">
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
          <div className="flex flex-col justify-center gap-2">
            <h5 className="text-center font-bold capitalize transition-colors">
              {socialTitle}
            </h5>
            <div className="flex items-center justify-center gap-2">
              {socialLinks.map((item, idx) => {
                const IconComponent = Icons[item.title as keyof typeof Icons]

                return (
                  <Link
                    key={idx}
                    href={item.url}
                    className="text-foreground/60 transition-colors hover:text-foreground/80"
                  >
                    {IconComponent ? (
                      <IconComponent className="h-6 w-6" />
                    ) : (
                      item.title
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//   <div className="mx-auto flex max-w-6xl flex-col items-start justify-between text-sm sm:flex-row">
