import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

import Logo from "@/components/navbar/Logo"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import GridBackground from "@/components/ui/GridBackground"

import { navigationConfig } from "@/lib/config/navigation"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export default function Footer() {
  const t = useTranslations()
  const tFooter = useTranslations("footer")
  const tNavbar = useTranslations("navbar")

  const name = t("brand.shortName")
  const copyright = tFooter("copyright")
  const socialTitle = tFooter("social.title")

  const navItems = navigationConfig.map((item) => ({
    id: item.id,
    href: item.href,
    disabled: item.disabled,
    title: tNavbar(`pages.${item.id}`),
  }))

  return (
    <footer className="relative border-t bg-background px-2 py-8">
      <GridBackground />

      <div className="relative mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-8 lg:flex-row">
        <div>
          <div className="flex justify-center md:justify-start">
            <Link
              href="/"
              aria-label={tNavbar("brandLinkLabel")}
              className="flex items-center gap-4 text-2xl font-bold"
            >
              <Logo />
              <span className="capitalize">{name}</span>
            </Link>
          </div>

          <div className="mt-2 text-center text-sm text-muted-foreground md:text-start">
            <p>{copyright}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <nav aria-label={tNavbar("desktopNavigationLabel")}>
            <ul className="flex flex-col items-center md:items-start">
              {navItems.map((item) => (
                <li key={item.id}>
                  {item.disabled ? (
                    <span
                      aria-disabled="true"
                      className={cn(
                        buttonVariants({
                          variant: "link",
                        }),
                        "cursor-not-allowed text-xl opacity-40"
                      )}
                    >
                      {item.title}

                      <span className="sr-only">
                        {" "}
                        ({tNavbar("disabledLabel")})
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        buttonVariants({
                          variant: "link",
                        }),
                        "text-xl"
                      )}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col justify-center gap-2">
            <h2 className="text-center font-bold capitalize lg:text-start">
              {socialTitle}
            </h2>

            <div className="flex items-center gap-2">
              <a
                href={siteConfig.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icons.gitHub
                  aria-hidden="true"
                  className="size-10 text-foreground/60 transition-colors hover:text-foreground/80"
                />
              </a>

              <a
                href={siteConfig.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icons.linkedin
                  aria-hidden="true"
                  className="size-10 text-foreground/60 transition-colors hover:text-foreground/80"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
