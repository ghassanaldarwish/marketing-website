import type { NavigationHref, NavigationItemId } from "@/lib/config/navigation"

export type NavigationItem = {
  id: NavigationItemId
  title: string
  href: NavigationHref
  disabled: boolean
}

export type LinkType = {
  title: string
  url: string
  disabled?: boolean
}
