import { describe, expect, it } from "vitest"

import { createTerminalLines } from "./terminal-content"

describe("createTerminalLines", () => {
  it("returns commands and outputs in their visual order", () => {
    expect(
      createTerminalLines(["pnpm build", "git push"], {
        0: ["Build complete"],
        1: ["Push started", "Push complete"],
      })
    ).toEqual([
      { type: "command", content: "pnpm build" },
      { type: "output", content: "Build complete" },
      { type: "command", content: "git push" },
      { type: "output", content: "Push started" },
      { type: "output", content: "Push complete" },
    ])
  })

  it("keeps commands that have no output", () => {
    expect(createTerminalLines(["pwd"], {})).toEqual([
      { type: "command", content: "pwd" },
    ])
  })
})
