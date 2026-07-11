import {
  ArrowRight,
  Brain,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Server,
} from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "@/i18n/routing"
import { Card } from "../ui/card"
import { Alert } from "../ui/alert"
export default function ArchitectureShowcase() {
  return (
    <section className="border-y bg-foreground/2 py-12 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
            Architecture Showcase
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Every scalable application begins with thoughtful architecture.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            I use diagrams to explain how systems are structured: AI agents,
            APIs, services, queues, databases, observability, infrastructure,
            and deployment workflows.
          </p>

          <Button className="mt-8" asChild>
            <Link href="/articles">
              Explore Architecture
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Client App", Code2],
              ["API Layer", GitBranch],
              ["AI Agent", Brain],
              ["Vector DB", Database],
              ["Services", Server],
              ["Cloud Deploy", Cloud],
            ].map(([label, Icon]) => {
              const IconComponent = Icon as typeof Code2

              return (
                <Alert
                  key={label as string}
                  className="bg-accent-foreground/1 p-8"
                >
                  <IconComponent className="mb-4 h-6 w-6 text-accent-foreground" />
                  <p className="font-medium">{label as string}</p>
                </Alert>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}
