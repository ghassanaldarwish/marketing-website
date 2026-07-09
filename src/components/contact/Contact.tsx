"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
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




export function ContactModel() {
    const t = useTranslations("hero")
  
  const contact = t("contact")



  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>

           <Button size="lg" className="text-lg">
                {contact}
              </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-[calc(100%-2rem)] data-[size=default]:md:max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Contact Me</AlertDialogTitle>
          <AlertDialogDescription>
    
          </AlertDialogDescription>
       
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
     <Button type="submit" >
            Send
          </Button>        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
