export enum LOCALE {
  en = "en",
  ar = "ar",
  de = "de",
}

export type NavbarPagesType = {
  title: string
  url: string
  disabled: boolean
}

export type HeroType = {
  title: string
  description: string
  badge: string[]
  contact: string
}
