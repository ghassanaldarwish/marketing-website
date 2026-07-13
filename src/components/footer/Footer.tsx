import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Logo from "../navbar/Logo"
import { LinkType } from "@/lib/types"
import { buttonVariants } from "../ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "../ui/icons"
import GridBackground from "../ui/GridBackground"
import { siteConfig } from "@/lib/site"

export default function Footer() {
  const tFooter = useTranslations("footer")
  const tNavbar = useTranslations("navbar")
  const t = useTranslations()
  const name = t("brand.shortName")
  const copyright = tFooter("copyright")
  const navItems = tNavbar.raw("pages") as LinkType[]
  const socialTitle = tFooter("social.title")

  return (
    <div className="relative border-t bg-background px-2 py-8">
      <GridBackground />
      <div className="relative mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-8 lg:flex-row">
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
          <div className="flex flex-col justify-center md:items-start">
            {navItems.map((i, idx) =>
              i.disabled ? (
                <div
                  key={idx}

                  style={{
                    textDecoration: "none",
                    fontSize: 20,
                  }}

                  className={cn(
                    "cursor-not-allowed text-center opacity-30",
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
                  style={{
                    textDecoration: "none",
                    fontSize: 20,
                  }}
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
            <div className="flex items-center gap-2">
              <a href={siteConfig.socialLinks.github} target="_blank">
                <Icons.gitHub className="h-10 w-10 text-foreground/60 transition-colors hover:text-foreground/80" />
              </a>
              <a href={siteConfig.socialLinks.linkedin} target="_blank">
                <Icons.linkedin className="h-10 w-10 text-foreground/60 transition-colors hover:text-foreground/80" />
              </a>{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//   <div className="mx-auto flex max-w-6xl flex-col items-start justify-between text-sm sm:flex-row">
