"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button"

import { ContactForm } from "./ContactForm"

export function ContactModel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const t = useTranslations("contactModal")
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="text-lg">
          {t("trigger")}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-[calc(100%-2rem)] data-[size=default]:md:max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>

          <AlertDialogDescription>{t("description")}</AlertDialogDescription>

          <ContactForm setIsOpen={setIsOpen} />
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel> {t("cancel")}</AlertDialogCancel>

          <Button type="submit" form="contact-form">
            {t("submit")}{" "}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
