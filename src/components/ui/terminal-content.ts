export type TerminalLine = {
  type: "command" | "output"
  content: string
}

export function createTerminalLines(
  commands: readonly string[],
  outputs: Readonly<Record<number, readonly string[]>>
): TerminalLine[] {
  return commands.flatMap((command, commandIndex) => [
    {
      type: "command" as const,
      content: command,
    },
    ...(outputs[commandIndex] ?? []).map((output) => ({
      type: "output" as const,
      content: output,
    })),
  ])
}
