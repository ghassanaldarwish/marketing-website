import "server-only"

import { z } from "zod"

import type { ArticleRuntimeMode } from "@/features/articles/domain/article-parser"

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  const normalizedValue = value.trim()
  return normalizedValue.length > 0 ? normalizedValue : undefined
}, z.string().optional())

const articleEnvironmentSchema = z.object({
  MDX_CONTENT_SOURCE: z.enum(["local", "remote", "hybrid"]).default("local"),
  MDX_REVALIDATE_SECONDS: z.coerce.number().int().nonnegative().default(3600),
  MDX_REMOTE_BASE_URL: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value
    }

    const normalizedValue = value.trim()
    return normalizedValue.length > 0 ? normalizedValue : undefined
  }, z.string().url().optional()),
  MDX_REMOTE_TOKEN: optionalString,
  MDX_REMOTE_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(60_000)
    .default(10_000),
})

export type ArticleEnvironment = {
  contentSource: "local" | "remote" | "hybrid"
  revalidateSeconds: number
  remoteBaseUrl?: string
  remoteToken?: string
  remoteTimeoutMs: number
}

export function parseArticleEnvironment(
  environment: NodeJS.ProcessEnv
): ArticleEnvironment {
  const result = articleEnvironmentSchema.safeParse(environment)

  if (!result.success) {
    throw new Error(
      `Invalid MDX environment configuration:\n${result.error.message}`
    )
  }

  return {
    contentSource: result.data.MDX_CONTENT_SOURCE,
    revalidateSeconds: result.data.MDX_REVALIDATE_SECONDS,
    remoteBaseUrl: result.data.MDX_REMOTE_BASE_URL,
    remoteToken: result.data.MDX_REMOTE_TOKEN,
    remoteTimeoutMs: result.data.MDX_REMOTE_TIMEOUT_MS,
  }
}

export function getArticleRuntimeMode(): ArticleRuntimeMode {
  switch (process.env.NODE_ENV) {
    case "production":
      return "production"
    case "test":
      return "test"
    default:
      return "development"
  }
}

export const articleEnvironment = parseArticleEnvironment(process.env)
