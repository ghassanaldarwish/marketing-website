import { ArrowRight, Layers3 } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "@/i18n/routing"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Alert } from "../ui/alert"

const projects = [
  {
    title: "AI Trading Assistant",
    category: "AI Engineering / Backend",
    description:
      "An AI-powered platform that combines language models, structured workflows, backend APIs, and real-time data processing to support intelligent analysis and decision-making.",
    problem:
      "The challenge was connecting AI reasoning with reliable backend services while keeping the system explainable, scalable, and production-ready.",
    stack: [
      "Python",
      "TypeScript",
      "OpenAI",
      "LangChain",
      "PostgreSQL",
      "Docker",
    ],
  },
  {
    title: "Scalable Backend Platform",
    category: "Backend Architecture",
    description:
      "A distributed backend system designed around microservices, authentication, REST and GraphQL APIs, background jobs, and production deployment workflows.",
    problem:
      "The goal was to keep services maintainable while supporting independent deployments, clean communication, and predictable scaling.",
    stack: ["Node.js", "TypeScript", "GraphQL", "Redis", "Docker", "CI/CD"],
  },
  {
    title: "AI Workflow Automation",
    category: "AI Agents / DevOps",
    description:
      "Automation pipelines connecting APIs, language models, backend services, and external tools to reduce manual work and improve engineering productivity.",
    problem:
      "The main focus was designing workflows that are useful, repeatable, observable, and safe enough for real-world usage.",
    stack: ["Python", "AI Agents", "MCP", "Ollama", "Docker", "Linux"],
  },
]
export default function SelectedProjects() {
  return (
    <section id="projects" className="relative border border-y py-12 lg:py-24">
      <div className="mx-auto max-w-6xl px-2 lg:px-0">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
            Selected Projects
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Case studies focused on engineering decisions.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Instead of showing only screenshots, I present projects through
            architecture, trade-offs, implementation decisions, and lessons
            learned.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {projects.map((project, index) => (
            <article
              key={project.title}
              className="grid gap-8 rounded-3xl border bg-background/70 p-6 lg:grid-cols-[0.8fr_1.2fr]"
            >
              <Card className="bg-foreground/1 p-5">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Project 0{index + 1}
                  </span>
                  <Layers3 className="h-5 w-5 text-accent-foreground" />
                </div>

                <div className="space-y-3">
                  {[
                    "Input",
                    "Processing",
                    "Services",
                    "Data",
                    "Deployment",
                  ].map((label, stepIndex) => (
                    <div key={label}>
                      <Alert className="bg-background px-4 py-3 text-sm">
                        {label}
                      </Alert>
                      {stepIndex !== 4 && (
                        <div className="mx-auto h-4 w-px bg-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <div>
                <p className="text-sm font-medium text-accent-foreground">
                  {project.category}
                </p>
                <h3 className="mt-3 text-3xl font-semibold">{project.title}</h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {project.description}
                </p>

                <Alert className="mt-6 bg-foreground/1 p-4">
                  <h4 className="font-medium">Engineering Challenge</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {project.problem}
                  </p>
                </Alert>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="outline"

                      className="px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                <Button className="mt-6" variant="outline" asChild>
                  <Link href="/projects">
                    Read Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
