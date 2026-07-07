/* eslint-disable @next/next/no-img-element */
import React from "react"
import { ContainerScroll } from "./ContainerScroll"
import { Terminal } from "./Terminal"

export default function Benefits() {
  return (
    <section className="relative m-auto flex w-full max-w-6xl flex-col">
      <Terminal
        className="w-full"
        commands={[
          "npx shadcn@latest init",
          "npm install motion",
          "npx shadcn@latest add button card",
          "Term Deez Nuts",
        ]}
        outputs={{
          0: [
            "✔ Preflight checks passed.",
            "✔ Created components.json",
            "✔ Initialized project.",
          ],
          1: ["added 1 package in 2s"],
          2: ["✔ Done. Installed button, card."],
        }}
        typingSpeed={45}
        delayBetweenCommands={1000}
      />
    </section>
  )
}
