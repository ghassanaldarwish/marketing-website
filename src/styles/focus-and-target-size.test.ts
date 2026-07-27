import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

const globalsCss = readFileSync(join(__dirname, "globals.css"), "utf-8")
const buttonSource = readFileSync(
  join(__dirname, "../components/ui/button.tsx"),
  "utf-8"
)
const inputSource = readFileSync(
  join(__dirname, "../components/ui/input.tsx"),
  "utf-8"
)

describe("shared focus-visible contract", () => {
  it("suppresses the global outline on the button data-slot so only the component ring shows", () => {
    expect(globalsCss).toMatch(
      /\[data-slot=(["']?)button\1\]:focus-visible[\s\S]{0,120}?{[^}]*outline:\s*none/
    )
  })

  it("also suppresses the global outline when buttonVariants styles a link", () => {
    expect(globalsCss).toMatch(
      /\[class~=(["'])group\/button\1\]:focus-visible[\s\S]{0,120}?outline:\s*none/
    )
  })

  it("suppresses the global outline on the input data-slot so only the component ring shows", () => {
    expect(globalsCss).toMatch(
      /\[data-slot=(["']?)input\1\]:focus-visible[\s\S]{0,120}?{[^}]*outline:\s*none/
    )
  })

  it("still defines a single high-contrast global outline rule for elements without their own ring", () => {
    expect(globalsCss).toMatch(
      /:focus-visible\s*{\s*outline:\s*2px solid var\(--foreground\)/
    )
  })

  it("uses opaque foreground focus rings for shared Button and Input controls", () => {
    expect(buttonSource).toMatch(/focus-visible:ring-foreground/)
    expect(inputSource).toMatch(/focus-visible:ring-foreground/)
    expect(buttonSource).not.toMatch(/focus-visible:ring-ring\/50/)
    expect(inputSource).not.toMatch(/focus-visible:ring-ring\/50/)
  })
})

describe("Button target size", () => {
  const sizeBlockMatch = buttonSource.match(/size:\s*{([\s\S]*?)},\n\s*},/)
  const sizeBlock = sizeBlockMatch?.[1] ?? ""

  it("gives the default size an at-least-44px (h-11) height", () => {
    const defaultSizeMatch = sizeBlock.match(/default:\s*\n?\s*"([^"]*)"/)
    expect(defaultSizeMatch).not.toBeNull()
    expect(defaultSizeMatch?.[1]).toMatch(/(?:^|\s)h-11(?:\s|$)/)
  })

  it("gives the lg size an at-least-44px (h-11) height", () => {
    const lgSizeMatch = buttonSource.match(/lg:\s*"([^"]*)"/)
    expect(lgSizeMatch).not.toBeNull()
    expect(lgSizeMatch?.[1]).toMatch(/(?:^|\s)h-11(?:\s|$)/)
  })

  it("keeps the xs compact opt-in smaller than 44px", () => {
    const xsSizeMatch = buttonSource.match(/xs:\s*"([^"]*)"/)
    expect(xsSizeMatch?.[1]).toMatch(/(?:^|\s)h-6(?:\s|$)/)
  })

  it("keeps the sm compact opt-in smaller than 44px", () => {
    const smSizeMatch = buttonSource.match(/sm:\s*"([^"]*)"/)
    expect(smSizeMatch?.[1]).toMatch(/(?:^|\s)h-7(?:\s|$)/)
  })

  it("keeps the compact icon-xs and icon-sm opt-ins smaller than 44px", () => {
    const iconXsMatch = buttonSource.match(/"icon-xs":\s*"([^"]*)"/)
    const iconSmMatch = buttonSource.match(/"icon-sm":\s*"([^"]*)"/)
    expect(iconXsMatch?.[1]).toMatch(/(?:^|\s)size-6(?:\s|$)/)
    expect(iconSmMatch?.[1]).toMatch(/(?:^|\s)size-7(?:\s|$)/)
  })

  it("leaves the ordinary navbar icon sizes unchanged since their fixed-height navbar is out of scope", () => {
    const iconMatch = sizeBlock.match(/icon:\s*"([^"]*)"/)
    const iconLgMatch = sizeBlock.match(/"icon-lg":\s*"([^"]*)"/)
    expect(iconMatch?.[1]).toMatch(/(?:^|\s)size-8(?:\s|$)/)
    expect(iconLgMatch?.[1]).toMatch(/(?:^|\s)size-9(?:\s|$)/)
  })
})

describe("Input/Button height alignment", () => {
  it("keeps the shared Input control at h-11 (44px)", () => {
    expect(inputSource).toMatch(/["\s]h-11(?:\s|")/)
  })
})

describe("disabled state contract", () => {
  it("keeps Button non-interactive and dimmed when disabled", () => {
    expect(buttonSource).toMatch(/disabled:pointer-events-none/)
    expect(buttonSource).toMatch(/disabled:opacity-50/)
  })

  it("keeps Input non-interactive and dimmed when disabled", () => {
    expect(inputSource).toMatch(/disabled:pointer-events-none/)
    expect(inputSource).toMatch(/disabled:cursor-not-allowed/)
    expect(inputSource).toMatch(/disabled:opacity-50/)
  })
})
