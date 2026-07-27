import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

type Case = {
  file: string
  description: string
  forbidden: string
  required: string
}

// Canonical rule (issue #48): section gutters use `px-4 sm:px-6` on the
// element that owns the horizontal inset, and primary containers use
// `mx-auto max-w-6xl`, matching the reference implementation in
// src/components/selectedProjects/SelectedProjects.tsx.
const CASES: Case[] = [
  {
    file: "src/components/hero/Hero.tsx",
    description:
      "Hero's full-bleed wrapper does not own the gutter (only the centered containers do)",
    forbidden: `className="relative overflow-x-clip px-2 lg:mb-24 lg:px-0"`,
    required: `className="relative overflow-x-clip lg:mb-24"`,
  },
  {
    file: "src/components/hero/Hero.tsx",
    description:
      "Hero's primary centered container uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="relative m-auto flex h-full max-w-6xl flex-col pt-12 md:mt-0 lg:flex-row"`,
    required: `className="relative m-auto flex h-full max-w-6xl flex-col px-4 pt-12 sm:px-6 md:mt-0 lg:flex-row"`,
  },
  {
    file: "src/components/hero/Hero.tsx",
    description:
      "Hero's metrics centered container uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="relative m-auto max-w-6xl items-end justify-between lg:flex"`,
    required: `className="relative m-auto max-w-6xl items-end justify-between px-4 sm:px-6 lg:flex"`,
  },
  {
    file: "src/components/coreExpertise/CoreExpertise.tsx",
    description:
      "CoreExpertise container uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="mx-auto max-w-6xl px-2 lg:px-0"`,
    required: `className="mx-auto max-w-6xl px-4 sm:px-6"`,
  },
  {
    file: "src/components/architectureShowcase/ArchitectureShowcase.tsx",
    description:
      "ArchitectureShowcase container uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="mx-auto grid max-w-6xl gap-12 px-2 lg:grid-cols-2 lg:items-center lg:px-0"`,
    required: `className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center"`,
  },
  {
    file: "src/components/engineeringBeyondCode/EngineeringBeyondCode.tsx",
    description:
      "EngineeringBeyondCode container uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="mx-auto grid max-w-6xl gap-12 px-2 lg:grid-cols-2 lg:items-center lg:px-0"`,
    required: `className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center"`,
  },
  {
    file: "src/components/technologies/Technologies.tsx",
    description: "Technologies section does not carry its own gutter override",
    forbidden: `className="relative lg:px-0"`,
    required: `className="relative"`,
  },
  {
    file: "src/components/technologies/Technologies.tsx",
    description:
      "Technologies inner container uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="relative m-auto flex h-full max-w-6xl flex-col gap-8 px-2 py-8 lg:gap-16 lg:px-0 lg:py-24"`,
    required: `className="relative m-auto flex h-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:gap-16 lg:py-24"`,
  },
  {
    file: "src/components/finalCTA/FinalCTA.tsx",
    description: "FinalCTA section uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="min-w-0 px-2 py-12 sm:px-0 lg:py-24"`,
    required: `className="min-w-0 px-4 py-12 sm:px-6 lg:py-24"`,
  },
  {
    file: "src/components/finalCTA/FinalCTA.tsx",
    description:
      "FinalCTA card matches the site's max-w-6xl primary container width",
    forbidden: `className="mx-auto max-w-5xl min-w-0 rounded-lg border border-border bg-muted px-2 py-8 text-center text-foreground sm:p-12 lg:px-0"`,
    required: `className="mx-auto max-w-6xl min-w-0 rounded-lg border border-border bg-muted p-6 text-center text-foreground sm:p-12"`,
  },
  {
    file: "src/components/footer/Footer.tsx",
    description: "Footer full-bleed wrapper does not own the gutter",
    forbidden: `className="relative border-t bg-background px-2 py-8"`,
    required: `className="relative border-t bg-background py-8"`,
  },
  {
    file: "src/components/footer/Footer.tsx",
    description: "Footer content row uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="relative mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-8 lg:flex-row"`,
    required: `className="relative mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-8 px-4 sm:px-6 lg:flex-row"`,
  },
  {
    file: "src/app/[locale]/about/page.tsx",
    description: "About intro section uses the canonical px-4 sm:px-6 gutter",
    forbidden: `className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]"`,
    required: `className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]"`,
  },
  {
    file: "src/app/[locale]/about/page.tsx",
    description:
      "About journey section matches the site's max-w-6xl primary container width",
    forbidden: `className="mx-auto max-w-7xl px-6"`,
    required: `className="mx-auto max-w-6xl px-4 sm:px-6"`,
  },
  {
    file: "src/app/[locale]/contact/page.tsx",
    description: "Contact main keeps its gutter at every breakpoint",
    forbidden: `className="relative min-h-screen overflow-x-clip px-4 sm:px-6 lg:px-0"`,
    required: `className="relative min-h-screen overflow-x-clip px-4 sm:px-6"`,
  },
]

describe("layout gutter and width consistency (issue #48)", () => {
  it.each(CASES)("$description", ({ file, forbidden, required }) => {
    const source = readFileSync(join(process.cwd(), file), "utf-8")

    expect(source).not.toContain(forbidden)
    expect(source).toContain(required)
  })
})
