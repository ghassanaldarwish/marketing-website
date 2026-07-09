import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="relative px-2 lg:px-0 min-h-screen ">
      <div className="relative m-auto mt-12 h-screen max-w-3xl flex flex-col items-start gap-4 md:justify-center md:gap-16">
        <div className="w-full">
       <h1 className="text-3xl lg:text-6xl">
           Get in Touch
          </h1>

          <p className="min-h-30 text-xl md:min-h-10">
          Have a project, job opportunity, or technical question? Send me a
            message.
          </p>
</div>
          <ContactForm />
            <Button type="submit" form="contact-form">
            Send Message
          </Button>
      </div>
    </div>
  )
}
