import { ContactModel } from "../contact/Contact"
import { Alert } from "../ui/alert"

export default function FinalCTA() {
  return (
    <section className="py-12 lg:py-24">
      <Alert className="mx-auto max-w-5xl bg-muted-foreground/1 p-8 px-2 text-center sm:p-12 lg:px-0">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Let&apos;s build something exceptional.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Whether you are building AI products, scalable backend platforms, or
          modern cloud infrastructure, I am always interested in meaningful
          engineering challenges and opportunities.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <ContactModel />
        </div>
      </Alert>
    </section>
  )
}
