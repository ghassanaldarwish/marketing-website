# Content authoring

This guide is the authoring contract for localized engineering articles. The
runtime source of truth remains the article domain and server implementation;
`pnpm content:check` applies those same validation rules before a build.

## Choose the locale and identity

Published locales are English (`en`), German (`de`), and Arabic (`ar`). An
article may exist in only some locales; the validator does not require every
article to be translated everywhere.

Choose a lowercase kebab-case slug and use it as the filename:

```text
content/articles/en/production-ai-platform.mdx
```

Do not create both `.md` and `.mdx` files for the same locale and slug. Reuse
the same slug across translations when possible. If translated slugs must
differ, give every translation the same `translationKey` so sitemap and
alternate-link grouping remain deterministic.

## Add frontmatter

Every article starts with one frontmatter block. Required fields are marked in
the example:

```yaml
---
title: "Building a Production AI Platform" # required
description: "A concise search and card description." # required
challenge: "The main engineering challenge shown on project cards."
category: "AI Engineering / Backend" # required
status: "Case Study"
publishedAt: "2026-07-16" # required, YYYY-MM-DD
updatedAt: "2026-07-16" # optional, YYYY-MM-DD
coverImage: "/articles/production-ai-platform/cover.png" # required
coverImageAlt: "Architecture of the production AI platform" # required
tags:
  - "AI Engineering"
stack:
  - "TypeScript"
icon: "brain"
featured: false
order: 1
draft: false
translationKey: "production-ai-platform"
---
```

`icon` accepts `brain`, `server`, `workflow`, `layers`, `cloud`, or `code`.
`status` defaults to `Case Study`; `tags` and `stack` default to empty arrays;
`icon` defaults to `code`; and `featured` and `draft` default to `false`.
`order` must be a non-negative integer.

Drafts are visible in development and excluded from production lists, routes,
sitemap entries, and social metadata.

## Add the article body and assets

Write Markdown or trusted MDX after the closing frontmatter delimiter. Do not
place another `---` delimiter at the beginning of the body. Normal horizontal
rules later in the article are allowed.

The renderer supports GitHub-flavored Markdown, code fences, tables, heading
anchors, and the shared `<Callout>` component. MDX expressions execute as
trusted application code on the server. Only approved authors may change local
MDX or the configured remote origin; never use an untrusted remote source.

Put images under the public directory and reference them with root-relative
paths:

```text
public/articles/production-ai-platform/cover.png
public/articles/production-ai-platform/architecture.png
```

```md
![Service architecture](/articles/production-ai-platform/architecture.png)
```

The required `coverImage` must resolve to an existing file below `public/`.

## Maintain the remote index fixture

Add the filename to the locale's `index.json`, even when production currently
uses local mode:

```json
{
  "files": ["production-ai-platform.mdx"]
}
```

The same directory can then be published as a remote source. Index entries
must be unique by locale and slug, use kebab-case `.md` or `.mdx` filenames,
and reference existing files. Validation reads these fixtures locally and
never contacts a remote server.

## Validate and preview

Run the authoring check first:

```bash
pnpm content:check
```

It validates all locale dictionaries, article frontmatter, duplicate
identities, cover files, remote-index fixtures, explicit placeholder markers,
and accidental leading delimiters. Failures include the locale, slug, and
repository-relative file path. The command performs no writes, mutation, or
network requests.

Then run the full gates and preview the affected localized routes:

```bash
pnpm check
pnpm test:e2e
pnpm dev
```

Review the article list and detail route in every locale where it exists. For
Arabic, check RTL prose plus mixed LTR code, URLs, and technology names. Also
verify narrow-screen code/table scrolling, light/dark/system themes, metadata,
canonical and alternate URLs, JSON-LD, and `/sitemap.xml`.

## Source modes and precedence

- `local` discovers `.md` and `.mdx` files directly under
  `content/articles/{locale}`.
- `remote` reads `{locale}/index.json` and the referenced files from
  `MDX_REMOTE_BASE_URL`.
- `hybrid` merges both sources. Remote content wins when list entries share a
  slug; a detail lookup tries remote first and falls back to local when the
  remote article is absent.

Remote requests may use `MDX_REMOTE_TOKEN`, cache for
`MDX_REVALIDATE_SECONDS`, and time out after `MDX_REMOTE_TIMEOUT_MS`. The
remote origin is trusted input and must use the same frontmatter contract.
