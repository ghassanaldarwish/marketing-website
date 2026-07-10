import { Brain, Cloud, Code2, Server } from "lucide-react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
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
    <section className="border border-y bg-foreground/2 py-12 lg:py-24">
      <div className="mx-auto max-w-6xl px-2 lg:px-0">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
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
              <Card
                key={item.title}
                className="group p-6 transition hover:-translate-y-1 hover:bg-foreground/5"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border bg-accent-foreground/10 accent-foreground">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <Badge
                      key={point}
                      variant="outline"
                      className="px-3 py-1 text-xs text-muted-foreground"
                    >
                      {point}
                    </Badge>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
