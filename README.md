# ghassan.de — Marketing Website

Production portfolio and engineering publication platform for **Ghassan
Aldarwish**, focused on AI engineering, backend systems, DevOps, cloud
infrastructure, and software architecture.

[Live website](https://ghassan.de) ·
[GitHub profile](https://github.com/ghassanaldarwish) ·
[LinkedIn](https://linkedin.com/in/ghassan-aldarwish)

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Routes and locales](#routes-and-locales)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Article and MDX system](#article-and-mdx-system)
- [Contact form](#contact-form)
- [SEO and social sharing](#seo-and-social-sharing)
- [Styling, themes, and accessibility](#styling-themes-and-accessibility)
- [Scripts and quality checks](#scripts-and-quality-checks)
- [Deployment](#deployment)
- [Development workflow](#development-workflow)
- [License](#license)

## Overview

This repository contains the source for [ghassan.de](https://ghassan.de). It is
more than a static portfolio: it combines localized marketing pages, detailed
engineering case studies, a hybrid MDX content pipeline, a server-backed
contact form, and a complete SEO layer.

The application uses the Next.js App Router and keeps most rendering and
content work on the server. Client Components are limited to interactive
islands such as navigation, theme controls, animation, and form handling.

## Features

- Localized, locale-prefixed routes powered by `next-intl`.
- English, German, and Arabic dictionaries with automatic RTL document
  direction for Arabic.
- Home, About, Engineering, article detail, Contact, and localized 404 pages.
- Local, remote, or hybrid MDX article loading with runtime validation.
- GitHub-flavored Markdown, syntax highlighting, heading anchors, tables, and
  custom MDX components.
- Responsive light, dark, and system themes with theme-aware brand assets.
- Contact form validation in both the browser and server action, followed by
  Telegram delivery in production.
- Localized metadata, canonical URLs, `hreflang`, sitemap, robots rules,
  JSON-LD, and generated Open Graph/Twitter images.
- Responsive shadcn/Radix UI components, Motion animations, keyboard focus
  treatment, and reduced-motion support.

## Technology stack

| Area               | Technology                                                          |
| ------------------ | ------------------------------------------------------------------- |
| Framework          | Next.js 16 App Router, React 19, TypeScript                         |
| Styling            | Tailwind CSS 4, shadcn/ui, Radix UI, CSS custom properties          |
| Localization       | next-intl, rtl-detect                                               |
| Content            | MDX 3, gray-matter, Zod, remark/rehype plugins                      |
| Code rendering     | rehype-pretty-code, Shiki                                           |
| Forms              | React Hook Form, Zod, `@hookform/resolvers`                         |
| Server integration | Next.js Server Actions, Axios, Telegram Bot API                     |
| UI behavior        | Motion, next-themes, Lucide icons, Sonner                           |
| SEO                | Next.js Metadata API, `next/og`, JSON-LD, sitemap and robots routes |
| Tooling            | pnpm, ESLint 9, Prettier 3                                          |

The exact dependency versions are recorded in `package.json` and
`pnpm-lock.yaml`.

## Architecture

```mermaid
flowchart TD
  Request["Browser request"] --> Proxy["Locale proxy"]
  Proxy --> Router["Localized App Router"]
  Router --> Server["Server Components"]
  Router --> Client["Client islands"]
  Server --> Dictionaries["JSON dictionaries"]
  Server --> Content["MDX content service"]
  Content --> Local["Local content"]
  Content --> Remote["Remote content"]
  Client --> Action["Contact server action"]
  Action --> Telegram["Telegram Bot API"]
```

### Request and rendering flow

1. `src/proxy.ts` applies the `next-intl` routing policy and ensures public page
   URLs always contain a locale prefix.
2. `src/app/[locale]/layout.tsx` validates the locale, loads its dictionary,
   sets `lang` and `dir`, and installs the theme and translation providers.
3. Route-level Server Components load translations, content, and metadata.
4. Interactive behavior is delegated to focused Client Components.
5. Article content is loaded only on the server, validated, compiled, and
   rendered into the localized article route.

### Server and client boundaries

The repository intentionally uses React Server Components by default.

**Server-side responsibilities**

- Route rendering and localized metadata.
- Local and remote MDX discovery and loading.
- Frontmatter validation and draft filtering.
- MDX evaluation and syntax highlighting.
- JSON-LD construction, sitemap generation, and social images.
- Contact form revalidation and Telegram delivery.

**Client-side responsibilities**

- Mobile navigation and locale switching.
- Theme selection, theme-aware logo selection, and the `D` theme shortcut.
- React Hook Form state and validation feedback.
- Toast notifications and dialogs.
- Scroll-aware navigation and decorative animations.

The article server boundaries live in `src/features/articles/server` and
`src/components/mdx/mdx-renderer.tsx` through `server-only`. The contact
mutation is defined as a Server Action in
`src/features/contact/server/submit-contact-form.ts`.

## Routes and locales

The routing strategy uses `localePrefix: "always"`. A request to `/` is handled
by the localization proxy, which negotiates a supported locale and falls back
to English.

| Route                       | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| `/{locale}`                 | Portfolio home page                            |
| `/{locale}/about`           | Profile, background, and engineering journey   |
| `/{locale}/articles`        | Published engineering case studies             |
| `/{locale}/articles/{slug}` | MDX article detail page                        |
| `/{locale}/contact`         | Dedicated contact page                         |
| `/sitemap.xml`              | Localized static routes and published articles |
| `/robots.txt`               | Environment-aware crawler policy               |
| Any unknown localized route | Localized 404 page                             |

### Current locale coverage

| Locale         | Routing and dictionary    | Visible in language switcher | Bundled articles |
| -------------- | ------------------------- | ---------------------------- | ---------------- |
| English (`en`) | Yes                       | Yes                          | Yes              |
| German (`de`)  | Yes                       | Yes                          | Yes              |
| Arabic (`ar`)  | Yes, including RTL layout | No                           | No               |

Arabic routes can be opened directly. The current language control deliberately
offers English and German only, and the bundled MDX case studies currently
exist in those two languages.

## Project structure


```text
.
├── content/
│   ├── articles/
│   │   ├── en/                  # English MDX case studies
│   │   └── de/                  # German MDX case studies
│   └── dictionaries/            # en.json, de.json, ar.json
├── public/
│   ├── articles/                # Article images and diagrams
│   └── ...                      # Logos, flags, and profile assets
├── src/
│   ├── actions/                 # Server Actions
│   ├── app/
│   │   ├── [locale]/            # Localized App Router pages
│   │   ├── robots.ts            # robots.txt
│   │   └── sitemap.ts           # sitemap.xml
│   ├── components/
│   │   ├── contact/             # Contact dialog and form
│   │   ├── mdx/                 # Server-side MDX renderer
│   │   ├── navbar/              # Desktop/mobile navigation and controls
│   │   ├── seo/                 # Reusable social-image generators
│   │   ├── technologies/        # Technology logo components
│   │   └── ui/                  # shadcn and custom UI primitives
│   ├── hooks/                   # Locale-aware client hooks
│   ├── i18n/                    # Routing and request configuration
│   ├── lib/
│   │   ├── config/              # Site, navigation, and environment config
│   │   └── mdx/                 # Article schema and content repository
│   ├── styles/                  # Tailwind theme and global MDX styles
│   ├── mdx-components.tsx       # Shared MDX element mapping
│   └── proxy.ts                 # next-intl locale proxy
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Getting started

### Prerequisites

- Node.js `>=20.9.0` (required by the pinned Next.js version).
- pnpm compatible with lockfile version 9; pnpm 9 or newer is recommended.

### Installation

```bash
git clone https://github.com/ghassanaldarwish/marketing-website.git
cd marketing-website
pnpm install --frozen-lockfile
```

Create `.env.local` when you need to override the defaults or test an external
integration:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000

TELEGRAM_BOT_TOKEN=
GROUP_CHAT_ID=

MDX_CONTENT_SOURCE=local
MDX_REVALIDATE_SECONDS=3600
# MDX_REMOTE_BASE_URL=https://content.example.com/articles/
# MDX_REMOTE_TOKEN=

# GOOGLE_SITE_VERIFICATION=
# BING_SITE_VERIFICATION=
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The locale proxy redirects
the root request to a negotiated localized route, with English as the fallback.

In development, valid contact messages are printed to the server console and
are not sent to Telegram.

## Environment variables

| Variable                    | Required                        | Default / behavior                                 |
| --------------------------- | ------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | No                              | Canonical origin; defaults to `https://ghassan.de` |
| `TELEGRAM_BOT_TOKEN`        | For production contact delivery | Telegram bot credential; server-only               |
| `GROUP_CHAT_ID`             | For production contact delivery | Destination user, group, or channel chat ID        |
| `KV_REST_API_URL`           | For production contact delivery | Upstash Redis REST endpoint; server-only           |
| `KV_REST_API_TOKEN`         | For production contact delivery | Upstash Redis write token; server-only             |
| `CONTACT_RATE_LIMIT_SECRET` | For production contact delivery | HMAC secret for privacy-safe request identifiers   |
| `MDX_CONTENT_SOURCE`        | No                              | `local`; accepts `local`, `remote`, or `hybrid`    |
| `MDX_REVALIDATE_SECONDS`    | No                              | `3600`; non-negative cache revalidation interval   |
| `MDX_REMOTE_BASE_URL`       | In `remote` mode                | Root URL containing locale directories             |
| `MDX_REMOTE_TOKEN`          | No                              | Bearer token sent to the remote content service    |
| `GOOGLE_SITE_VERIFICATION`  | No                              | Adds Google verification metadata                  |
| `BING_SITE_VERIFICATION`    | No                              | Adds Bing `msvalidate.01` metadata                 |
| `NODE_ENV`                  | Framework-managed               | Controls development logging and draft visibility  |
| `VERCEL_ENV`                | Vercel-managed                  | Prevents preview deployments from being indexed    |

Environment configuration for MDX is parsed with Zod when the server module is
loaded. Invalid enum values, URLs, or revalidation values fail early rather than
silently changing content behavior.

## Article and MDX system

The article facade in `src/features/articles/server/index.ts` exposes cached
`getArticles(locale)` and `getArticle(locale, slug)` functions and supports
three source modes.

| Mode     | Behavior                                                                |
| -------- | ----------------------------------------------------------------------- |
| `local`  | Reads `.md` and `.mdx` files from `content/articles/{locale}`           |
| `remote` | Reads the locale index and article files from `MDX_REMOTE_BASE_URL`     |
| `hybrid` | Merges local and remote lists; a remote article wins on a matching slug |

For a single article in hybrid mode, the loader checks remote content first and
falls back to the local file. Remote requests use Next.js revalidation tags and
the interval configured by `MDX_REVALIDATE_SECONDS`.

### Local content

Local mode discovers valid `.md` and `.mdx` files directly from each locale
directory. The `index.json` files are not needed for local discovery; they are
kept so the same content directory can be published as a remote content source.

Article filenames must use lowercase kebab-case:

```text
content/articles/en/production-ai-platform.mdx
```

Place referenced assets under `public/articles/{slug}` and use a root-relative
URL in frontmatter or Markdown:

```md
![Architecture diagram](/articles/production-ai-platform/architecture.png)
```

### Remote content contract

`MDX_REMOTE_BASE_URL` must expose content in this shape:

```text
<base-url>/
├── en/
│   ├── index.json
│   └── production-ai-platform.mdx
└── de/
    ├── index.json
    └── production-ai-platform.mdx
```

The locale index can be either of these forms:

```json
["production-ai-platform.mdx"]
```

```json
{
  "files": ["production-ai-platform.mdx"]
}
```

If `MDX_REMOTE_TOKEN` is set, the loader sends it as an `Authorization: Bearer`
header. A remote index must reference only existing kebab-case `.md` or `.mdx`
files.

### Frontmatter schema

Every article is parsed with `gray-matter` and validated by the Zod schema in
`src/lib/mdx/article-schema.ts`.

```yaml
---
title: "Building a Production AI Platform"
description: "A concise search and card description."
challenge: "The main engineering challenge shown on selected-project cards."
category: "AI Engineering / Backend"
status: "Case Study"
publishedAt: "2026-07-13"
updatedAt: "2026-07-13"
coverImage: "/articles/production-ai-platform/cover.png"
coverImageAlt: "Architecture of the production AI platform"
tags:
  - "AI Engineering"
  - "System Design"
stack:
  - "Python"
  - "TypeScript"
icon: "brain"
featured: false
order: 1
draft: false
translationKey: "production-ai-platform"
---
```

Field behavior:

- `title`, `description`, `category`, `publishedAt`, `coverImage`, and
  `coverImageAlt` are required.
- Dates must use `YYYY-MM-DD`.
- `status` defaults to `Case Study`.
- `tags` and `stack` default to empty arrays.
- `icon` accepts `brain`, `server`, `workflow`, `layers`, `cloud`, or `code`.
- `challenge`, `updatedAt`, `order`, and `translationKey` are optional.
- Drafts are available during development and excluded in production.
- Articles sort by featured status, explicit order, newest publication date,
  and finally title.

Use the same slug across locales for complete page-level `hreflang` metadata.
`translationKey` additionally lets the sitemap group translations whose slugs
are different.

### MDX rendering

Article bodies are evaluated on the server by
`src/components/mdx/mdx-renderer.tsx` with:

- GitHub-flavored Markdown.
- Stable heading IDs and visible/focusable heading links.
- Shiki dual-theme syntax highlighting through `rehype-pretty-code`.
- Styled headings, paragraphs, lists, tables, links, images, and blockquotes.
- A custom callout component:

```mdx
<Callout title="Design decision">Explain the important trade-off here.</Callout>
```

Code-fence metadata used by `rehype-pretty-code` is also supported:

````md
```ts title="worker.ts" showLineNumbers
export async function runWorker() {
  // ...
}
```
````

This runtime renderer is the only MDX compilation path. Local, remote, and
hybrid repositories all return the same validated article shape, and the
localized article route passes its body to this renderer with the shared
component map from `src/mdx-components.tsx`. Article files are content data;
they are not imported as Next.js route modules.

> [!IMPORTANT]
> MDX can contain executable expressions and is evaluated as trusted,
> author-controlled application code. Restrict who can modify local articles
> and publish to the configured remote origin. Never point production at an
> untrusted content source. If untrusted publishing is required later, make a
> separate security decision and render sanitized Markdown instead of MDX.

## Contact form

The contact experience is available as both a reusable dialog and a dedicated
page.

1. React Hook Form manages the Client Component state.
2. Zod validates name, email, and message before submission.
3. The Server Action reconstructs and validates the payload again.
4. An off-screen honeypot silently rejects automated submissions.
5. A privacy-safe HMAC request key is checked against Upstash Redis using a
   three-per-ten-minute client limit and a thirty-per-ten-minute global delivery
   budget.
6. Redis failures fail closed with the same localized retry-later response as a
   normal limit, and structured logs contain no email, message, or raw address.
7. Development and CI use an isolated in-memory limiter; production sends an
   allowed message to the configured Telegram chat.
8. Sonner displays success or error feedback and the dialog closes after a
   successful response.

Validation rules:

- Name: at least 2 characters after trimming.
- Email: valid email address.
- Message: 10–5,000 characters after trimming.

Keep `TELEGRAM_BOT_TOKEN` and `GROUP_CHAT_ID` server-side. They must never use a
`NEXT_PUBLIC_` prefix or be committed to the repository.

The Vercel Upstash integration supplies `KV_REST_API_URL` and
`KV_REST_API_TOKEN`. Generate `CONTACT_RATE_LIMIT_SECRET` independently and keep
all three values server-side. The limiter stores only expiring counters keyed by
an HMAC digest; it never stores contact content or a raw client address.

## SEO and social sharing

SEO behavior is implemented with the Next.js Metadata API rather than static
HTML fragments.

- Localized titles, descriptions, keywords, and categories.
- Canonical URLs and language alternatives with `x-default`.
- Open Graph and Twitter card metadata.
- Generated 1200×630 social images for the main routes and each article.
- Environment-aware indexing: non-production Vercel deployments disallow
  crawling.
- Sitemap entries for every localized static route and every published article.
- Article sitemap grouping through slug or `translationKey`.
- Optional Google and Bing verification metadata.
- JSON-LD graphs for `WebSite`, `WebPage`, `Person`, `ProfilePage`,
  `ContactPage`, `CollectionPage`, `ItemList`, and `TechArticle`.

The sitemap and article routes revalidate every hour by default, matching the
default remote-content cache interval.

## Styling, themes, and accessibility

- Tailwind CSS 4 theme tokens are defined in `src/styles/globals.css` using
  OKLCH colors and CSS custom properties.
- `next-themes` supplies light, dark, and system modes with system mode as the
  default.
- The brand logo changes with the resolved theme after hydration.
- Pressing `D` outside a form control toggles light and dark themes.
- Inter is the primary UI font and Geist Mono is used for code.
- Layouts use responsive Tailwind breakpoints and logical RTL utilities where
  navigation direction changes.
- Global focus-visible styling supports keyboard navigation.
- A `prefers-reduced-motion` rule reduces transitions, animations, and smooth
  scrolling.
- MDX tables scroll horizontally on narrow screens, while code blocks use
  accessible focus and overflow behavior.

## Scripts and quality checks

| Command          | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the Turbopack development server                  |
| `pnpm build`     | Create a production build                               |
| `pnpm start`     | Serve an existing production build                      |
| `pnpm lint`      | Run Next.js core-web-vitals and TypeScript ESLint rules |
| `pnpm typecheck` | Run TypeScript without emitting files                   |
| `pnpm format`    | Format all TypeScript and TSX files with Prettier       |

Run the current repository gates before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

For documentation-only changes, also verify Markdown formatting explicitly:

```bash
pnpm exec prettier --check README.md
```

The repository does not currently define unit, integration, or end-to-end test
scripts, and it does not contain a GitHub Actions workflow. Until those are
added, lint, typecheck, and the production build are the available automated
quality gates.

## Deployment

The project is Vercel-aware but can run on any platform that supports the
Next.js Node.js runtime.

### Vercel

1. Import the GitHub repository.
2. Use pnpm and keep the lockfile installation frozen.
3. Configure the production environment variables listed above.
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin.
5. Add Telegram credentials if the contact form should deliver messages.
6. Select and configure the intended MDX content mode.

Vercel supplies `VERCEL_ENV`; preview deployments are therefore excluded from
search indexing automatically.

### Self-hosted Node.js

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

When using local MDX, the runtime must be able to read the `content` directory.
For a Docker standalone deployment, enable the commented `output:
"standalone"` and `outputFileTracingIncludes` settings in `next.config.ts` so
local content is included in the deployment artifact.

## Development workflow

1. Branch from the latest `main`.
2. Keep the change focused and avoid committing secrets or local environment
   files.
3. Update every affected locale dictionary when changing shared interface copy.
4. Add translated MDX files and public assets together when publishing an
   article.
5. Run lint, typecheck, and a production build.
6. Open a pull request that explains the change, impact, and verification.

## License

No license file is currently included in this repository. The repository's
public visibility does not by itself grant permission to copy, modify, or
redistribute its contents.
