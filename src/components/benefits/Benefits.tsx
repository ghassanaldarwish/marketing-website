/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { ContainerScroll } from './ContainerScroll'
import { Terminal } from './Terminal'

export default function Benefits() {
  return (
<section className="flex flex-col relative">

      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl  font-semibold  w-full  absolute bg-background/50 backdrop-blur-sm -top-26 left-1/2 -translate-x-1/2">
              Unleash the power of <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Scroll Animations 
              </span>
            </h1>
          </>
        }
      >
        {/* <img
          src={`/hero.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        /> */}
   <Terminal
   className='w-full'
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
      </ContainerScroll>
    </section>
  )
}
