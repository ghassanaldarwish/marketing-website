import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

const playwrightConfig = readFileSync(
  join(process.cwd(), "playwright.config.ts"),
  "utf-8"
)

describe("local Playwright execution", () => {
  it("uses one worker outside CI to avoid overloading the production server", () => {
    expect(playwrightConfig).toMatch(
      /workers:\s*process\.env\.CI\s*\?\s*2\s*:\s*1/
    )
  })

  it("does not reuse a server from another checkout", () => {
    expect(playwrightConfig).toMatch(/reuseExistingServer:\s*false/)
  })
})
