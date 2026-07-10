import { GraduationCap, Layers3 } from "lucide-react"

const timeline = [
  {
    year: "Foundation",
    title: "Physics Background",
    description:
      "My academic background in Physics shaped the way I approach engineering: analytical thinking, problem decomposition, systems understanding, and curiosity about how complex things work.",
  },
  {
    year: "2017+",
    title: "Software Engineering",
    description:
      "I started building production software with a strong focus on backend development, APIs, databases, and scalable application architecture.",
  },
  {
    year: "Backend",
    title: "Distributed Systems & APIs",
    description:
      "Over the years, I worked deeply with Node.js, TypeScript, Python, REST APIs, GraphQL, gRPC, microservices, event-driven systems, and production backend platforms.",
  },
  {
    year: "DevOps",
    title: "Cloud, Containers & Automation",
    description:
      "I expanded into Docker, Kubernetes, Linux, CI/CD, infrastructure automation, and production deployment workflows to understand how software runs beyond the codebase.",
  },
  {
    year: "AI",
    title: "Production AI Engineering",
    description:
      "My recent focus is building AI systems with LLMs, AI agents, MCP servers, RAG pipelines, vector databases, OpenAI, Ollama, LangChain, Python, and TypeScript services.",
  },
]
export default function Page() {
  return (
    <div className="min-h-screen">
      <section className="py-12 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-2 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
              Who I Am
            </p>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              An engineer focused on systems, not just code.
            </h2>
          </div>

          <div className="space-y-6 text-lg leading-8 text-muted-foreground">
            <p>
              My work sits at the intersection of AI engineering, backend
              systems, DevOps, and modern web development. I enjoy building
              software that is not only functional, but also scalable, reliable,
              observable, and maintainable.
            </p>

            <p>
              Most of my strongest work is behind the scenes: backend services,
              APIs, infrastructure, automation, AI workflows, deployment
              systems, and architecture decisions. These are not always visible
              in a user interface, but they are the foundation that makes
              serious software work.
            </p>

            <p>
              At the same time, I care about frontend quality. A strong product
              needs clean interfaces, good performance, thoughtful UX, and clear
              communication. That is why I also build polished React and Next.js
              experiences that reflect the quality of the systems behind them.
            </p>
          </div>
        </div>
      </section>
      <section className="border border-y bg-foreground/2 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
              Engineering Journey
            </p>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              From analytical thinking to production AI systems.
            </h2>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              My path combines scientific thinking, backend engineering, cloud
              infrastructure, and modern AI development.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {timeline.map((item, index) => (
              <div
                key={item.title}
                className="grid gap-6 rounded-3xl border bg-background/70 p-6 md:grid-cols-[180px_1fr]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-foreground/2 text-accent-foreground">
                    {index === 0 ? (
                      <GraduationCap className="h-6 w-6" />
                    ) : (
                      <Layers3 className="h-6 w-6" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <p className="font-semibold">{item.year}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
