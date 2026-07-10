import { Alert } from "../ui/alert"
import { Card } from "../ui/card"

export default function EngineeringBeyondCode() {
  return (
    <section className="relative py-12 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-2 lg:grid-cols-2 lg:items-center lg:px-0">
        <div>
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
            Engineering Beyond Code
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Great software is not just about writing code.
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            It is about understanding business problems, designing scalable
            architectures, making thoughtful technical decisions, and building
            systems that continue to perform as they grow.
          </p>

          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            That is the mindset I bring to every project: combining AI, backend
            engineering, cloud infrastructure, and frontend craftsmanship to
            create software that works in the real world.
          </p>
        </div>
        <Card className="p-6">
          {/* <div className="rounded-3xl border border-white/10 bg-white/3 p-6"> */}
          <div className="space-y-4">
            {[
              ["Users", "Product experience and user value"],
              ["API Gateway", "Secure and documented entry points"],
              ["Services", "Clear domain boundaries and business logic"],
              ["AI Layer", "LLMs, agents, tools, memory, and retrieval"],
              ["Data", "Relational, cache, queue, and vector storage"],
              ["Observability", "Logs, metrics, monitoring, and alerts"],
            ].map(([title, desc], index) => (
              <div key={title}>
                <Alert className="">
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </Alert>
                {index !== 5 && (
                  <div className="mx-auto h-5 w-px bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </Card>
        {/* </div> */}
      </div>
    </section>
  )
}
