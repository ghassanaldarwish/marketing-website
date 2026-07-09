
const expectations = [
  {
    title: "Engineering Mindset",
    description:
      "I focus on solving the real problem behind the feature, not just writing code.",
  },
  {
    title: "Clear Communication",
    description:
      "Good documentation, technical clarity, and collaboration are part of the engineering process.",
  },
  {
    title: "Ownership",
    description:
      "I care about the full lifecycle: design, implementation, deployment, monitoring, and improvement.",
  },
  {
    title: "Continuous Learning",
    description:
      "AI, backend systems, and infrastructure evolve quickly. I stay curious and keep improving.",
  },
]

export default function WhyWorkWithMe() {
  return (
       <section className="border-y border-white/10 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
            Why Work With Me
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Beyond technology, I care about ownership and outcomes.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {expectations.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-background/60 p-6"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-4 leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
