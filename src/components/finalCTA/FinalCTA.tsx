import { useTranslations } from "next-intl"

import { ContactDialog } from "@/features/contact/contact-dialog"

import { Alert } from "../ui/alert"

export default function FinalCTA() {
  const t = useTranslations("home.finalCTA")

  return (
    <section className="py-12 lg:py-24">
      <Alert className="mx-auto max-w-5xl bg-muted-foreground/1 px-2 py-8 text-center sm:p-12 lg:px-0">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <ContactDialog />
        </div>
      </Alert>
    </section>
  )
}
