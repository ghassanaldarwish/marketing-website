import {
  ArrowRight,

} from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "@/i18n/routing"
const articles = [
  {
    title: "Building Production AI Agents with MCP",
    category: "AI Engineering",
    readTime: "6 min read",
    description:
      "How MCP helps connect AI agents with tools, context, and real backend systems.",
  },
  {
    title: "Scaling Backend APIs with Event-Driven Architecture",
    category: "Backend",
    readTime: "7 min read",
    description:
      "When queues, services, events, and async workflows become useful in production systems.",
  },
  {
    title: "Docker Networking Explained for Developers",
    category: "DevOps",
    readTime: "5 min read",
    description:
      "A practical explanation of Docker networks, containers, ports, and service communication.",
  },
]
export default function LatestArticles() {
  return (
   <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
              Latest Articles
            </p>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Sharing what I learn.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Practical knowledge, engineering insights, and lessons learned
              from building AI, backend, and production software systems.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/articles">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                <span>{article.category}</span>
                <span>{article.readTime}</span>
              </div>

              <h3 className="text-2xl font-semibold">{article.title}</h3>
              <p className="mt-4 leading-7 text-muted-foreground">
                {article.description}
              </p>

              <Link
                href="/articles"
                className="mt-6 inline-flex items-center text-sm font-medium text-blue-400"
              >
                Read Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
