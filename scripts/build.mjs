import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const nextCliPath = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
)
const tracingWarning = "Encountered unexpected file in NFT list"

async function runNextBuild() {
  const child = spawn(process.execPath, [nextCliPath, "build"], {
    cwd: projectRoot,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  })
  let output = ""

  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      const text = chunk.toString()
      output += text

      if (stream === child.stdout) {
        process.stdout.write(text)
      } else {
        process.stderr.write(text)
      }
    })
  }

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject)
    child.once("close", resolve)
  })

  if (exitCode !== 0) {
    throw new Error(`Next.js build failed with exit code ${exitCode}.`)
  }

  if (output.includes(tracingWarning)) {
    throw new Error(
      "Next.js output tracing broadened unexpectedly. Keep local article filesystem paths statically scoped to content/articles."
    )
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    })
  )

  return files.flat()
}

async function readTrace(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  return manifest.files.map((file) =>
    path.resolve(path.dirname(manifestPath), file)
  )
}

async function verifyArticleOutputTracing() {
  const contentDirectory = path.join(projectRoot, "content", "articles")
  const expectedArticleFiles = (await listFiles(contentDirectory)).filter(
    (file) => /\.(?:md|mdx)$/.test(file)
  )
  const serverDirectory = path.join(projectRoot, ".next", "server")
  const requiredTracePaths = [
    path.join(
      serverDirectory,
      "app",
      "[locale]",
      "articles",
      "[slug]",
      "page.js.nft.json"
    ),
    path.join(serverDirectory, "app", "sitemap.xml", "route.js.nft.json"),
  ]

  for (const tracePath of requiredTracePaths) {
    const tracedFiles = new Set(await readTrace(tracePath))

    for (const expectedFile of expectedArticleFiles) {
      if (!tracedFiles.has(expectedFile)) {
        throw new Error(
          `${path.relative(projectRoot, tracePath)} is missing ${path.relative(projectRoot, expectedFile)}.`
        )
      }
    }
  }

  const nextConfigPath = path.join(projectRoot, "next.config.ts")
  const allTracePaths = (await listFiles(serverDirectory)).filter((file) =>
    file.endsWith(".nft.json")
  )

  for (const tracePath of allTracePaths) {
    const tracedFiles = await readTrace(tracePath)

    if (tracedFiles.includes(nextConfigPath)) {
      throw new Error(
        `${path.relative(projectRoot, tracePath)} unexpectedly traces next.config.ts.`
      )
    }
  }

  process.stdout.write(
    `Verified ${expectedArticleFiles.length} bundled article files in production output traces.\n`
  )
}

await runNextBuild()
await verifyArticleOutputTracing()
