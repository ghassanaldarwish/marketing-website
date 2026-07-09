
import {
  ArrowRight,
 
  Layers3,

} from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "@/i18n/routing"

const projects = [
  {
    title: "AI Trading Assistant",
    category: "AI Engineering / Backend",
    description:
      "An AI-powered platform that combines language models, structured workflows, backend APIs, and real-time data processing to support intelligent analysis and decision-making.",
    problem:
      "The challenge was connecting AI reasoning with reliable backend services while keeping the system explainable, scalable, and production-ready.",
    stack: ["Python", "TypeScript", "OpenAI", "LangChain", "PostgreSQL", "Docker"],
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
  <section
      id="projects"
      className="border-y border-white/10 bg-white/[0.02] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
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
              className="grid gap-8 rounded-3xl border border-white/10 bg-background/70 p-6 lg:grid-cols-[0.8fr_1.2fr]"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Project 0{index + 1}
                  </span>
                  <Layers3 className="h-5 w-5 text-blue-400" />
                </div>

                <div className="space-y-3">
                  {["Input", "Processing", "Services", "Data", "Deployment"].map(
                    (label, stepIndex) => (
                      <div key={label}>
                        <div className="rounded-xl border border-white/10 bg-background/70 px-4 py-3 text-sm">
                          {label}
                        </div>
                        {stepIndex !== 4 && (
                          <div className="mx-auto h-4 w-px bg-white/10" />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-blue-400">
                  {project.category}
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  {project.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {project.description}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h4 className="font-medium">Engineering Challenge</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {project.problem}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
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
