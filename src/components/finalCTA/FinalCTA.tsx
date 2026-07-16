import { useTranslations } from "next-intl"

import { ContactDialog } from "@/features/contact/contact-dialog"

import { Alert } from "../ui/alert"

export default function FinalCTA() {
  const t = useTranslations("home.finalCTA")

  return (
    <section
      className="min-w-0 px-2 py-12 sm:px-0 lg:py-24"
      data-testid="final-cta"
    >
      <Alert className="mx-auto max-w-5xl min-w-0 bg-muted-foreground/1 px-2 py-8 text-center sm:p-12 lg:px-0">
        <h2
          className="min-w-0 text-4xl font-semibold tracking-tight [overflow-wrap:anywhere] break-words sm:text-5xl"
          data-testid="final-cta-heading"
        >
          {t("title")}
        </h2>
        <p
          className="mx-auto mt-6 max-w-2xl min-w-0 text-lg leading-8 [overflow-wrap:anywhere] break-words text-muted-foreground"
          data-testid="final-cta-description"
        >
          {t("description")}
        </p>
        <div
          className="mt-8 flex min-w-0 flex-col justify-center gap-4 sm:flex-row"
          data-testid="final-cta-action"
        >
          <ContactDialog />
        </div>
      </Alert>
    </section>
  )
}
