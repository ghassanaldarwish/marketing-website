"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContactForm } from "@/features/contact/contact-form"

export function ContactDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const t = useTranslations("contactModal")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-auto min-h-11 max-w-full min-w-0 text-center text-lg whitespace-normal"
        >
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <ContactForm
          submitLabel={t("submit")}
          cancelLabel={t("cancel")}
          onCancel={() => setIsOpen(false)}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
