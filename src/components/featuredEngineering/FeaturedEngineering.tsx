import {

  Network,

  Sparkles,
  
  Workflow,
} from "lucide-react"

const featuredEngineering = [
  {
    title: "Production AI Systems",
    icon: Sparkles,
    description:
      "I build AI applications beyond prototypes — with structured workflows, vector search, API integration, observability, and deployment-ready architecture.",
  },
  {
    title: "Distributed Backend Design",
    icon: Network,
    description:
      "I design backend systems around clear boundaries, clean APIs, service communication, queues, databases, and long-term maintainability.",
  },
  {
    title: "Automation & Infrastructure",
    icon: Workflow,
    description:
      "I automate deployments, monitoring, and operational workflows so teams can move faster while keeping systems reliable and predictable.",
  },
]

export default function FeaturedEngineering() {
  return (
  <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
            Featured Engineering
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            I build systems, not just features.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            My focus is turning complex technical requirements into simple,
            reliable, and scalable software architecture.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featuredEngineering.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <Icon className="h-8 w-8 text-blue-400" />
                <h3 className="mt-6 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
