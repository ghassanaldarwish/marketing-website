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
  const t = useTranslations("hero")
  const contact = t("contact")
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="text-lg">
          {contact}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-[calc(100%-2rem)] data-[size=default]:md:max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Get in Touch</AlertDialogTitle>

          <AlertDialogDescription>
            Have a project, job opportunity, or technical question? Send me a
            message.
          </AlertDialogDescription>

         <ContactForm setIsOpen={setIsOpen}/>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button type="submit" form="contact-form">
            Send Message
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}