import { ContactModel } from '../contact/Contact'


export default function FinalCTA() {
  return (
       <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_35%),rgba(255,255,255,0.03)] p-8 text-center sm:p-12">
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
      </div>
    </section>
  )
}
