/* eslint-disable @next/next/no-img-element */
import React from "react"
import { ContainerScroll } from "./ContainerScroll"
import { Terminal } from "./Terminal"

export default function Benefits() {
  return (
    <section className="relative m-auto flex w-full max-w-6xl flex-col">
      <h1 className="w-full bg-background/50 font-semibold backdrop-blur-sm lg:absolute lg:-top-44 lg:left-1/2 lg:-translate-x-1/2 lg:pt-8 lg:text-center lg:text-4xl">
        7+ Years Building with technologies trusted <br />
        <span className="mt-1 text-4xl leading-none font-bold lg:text-[6rem]">
          in production
        </span>
      </h1>
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
