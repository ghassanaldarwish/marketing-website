export const navigationConfig = [
  {
    id: "home",
    href: "/",
    disabled: false,
  },
  {
    id: "about",
    href: "/about",
    disabled: false,
  },
  {
    id: "articles",
    href: "/articles",
    disabled: false,
  },
  {
    id: "contact",
    href: "/contact",
    disabled: false,
  },
] as const

export type NavigationItemId = (typeof navigationConfig)[number]["id"]
export type NavigationHref = (typeof navigationConfig)[number]["href"]
