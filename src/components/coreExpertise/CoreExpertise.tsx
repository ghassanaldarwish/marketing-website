
import {

  Brain,
  Cloud,
  Code2,

  Server,

} from "lucide-react"
const expertise = [
  {
    title: "AI Engineering",
    icon: Brain,
    description:
      "Production-ready AI systems using LLMs, AI agents, RAG pipelines, MCP servers, vector databases, and intelligent automation.",
    points: ["LLM Applications", "AI Agents", "RAG", "MCP", "Vector Search"],
  },
  {
    title: "Backend Engineering",
    icon: Server,
    description:
      "Scalable backend platforms built with Node.js, TypeScript, Python, REST APIs, GraphQL, gRPC, and event-driven architecture.",
    points: ["Microservices", "REST APIs", "GraphQL", "gRPC", "Scalability"],
  },
  {
    title: "Cloud & DevOps",
    icon: Cloud,
    description:
      "Reliable cloud infrastructure with Docker, Kubernetes, Linux, CI/CD pipelines, monitoring, automation, and production deployments.",
    points: ["Docker", "Kubernetes", "CI/CD", "Linux", "Monitoring"],
  },
  {
    title: "Modern Frontend",
    icon: Code2,
    description:
      "Polished frontend experiences using React, Next.js, TypeScript, responsive layouts, animations, and performance-focused UI architecture.",
    points: ["React", "Next.js", "TypeScript", "UX", "Performance"],
  },
]

export default function CoreExpertise() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
            Core Expertise
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            The areas where I create the most value.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            My work sits at the intersection of AI engineering, backend
            architecture, cloud infrastructure, and modern frontend development.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {expertise.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-background/60 p-6 transition hover:-translate-y-1 hover:bg-white/[0.04]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-blue-500/10 text-blue-400">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
