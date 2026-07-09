import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import ar from "@/lib/dictionaries/ar.json"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function t<Path extends string>(path: Path): string {
  return getValueFromPath(ar, path) ?? path
}

type Dictionary = typeof ar

function getValueFromPath(obj: Dictionary, path: string): string | undefined {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc === "object" && acc !== null && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj) as string | undefined
}
