# AGENTS.md

This file is the operating guide for AI agents working in this repository. It
describes the verified project shape, the sources of truth, and the safety and
quality rules that apply to implementation work.

## Project identity

- Product: Ghassan Aldarwish's localized portfolio and engineering publication
  website.
- Production site: <https://ghassan.de>
- GitHub repository:
  <https://github.com/ghassanaldarwish/marketing-website>
- Work tracking: the private Notion database named `marketing-website`.
- Package manager: pnpm `10.12.1`, pinned in `package.json`.
- Runtime baseline: Node.js 20 or newer; CI currently uses Node.js 20 for the
  quality job and Node.js 22 for Playwright.

## Current verified snapshot

This section was checked against `main` at commit `6167f09` on 2026-07-16. It
is orientation, not a substitute for inspecting the current branch.

- The application uses Next.js 16 App Router, React 19, TypeScript, Tailwind
  CSS 4, next-intl, Radix/shadcn primitives, Motion, Vitest, and Playwright.
- English (`en`), German (`de`), and Arabic (`ar`) are all published locales.
  Locale prefixes are mandatory, and Arabic uses RTL document direction.
- All three locales are present in the language control, dictionaries, and
  bundled article content.
- The article system has feature-owned domain and server layers and supports
  `local`, `remote`, and `hybrid` content sources.
- The contact feature has localized client UI, shared Zod validation, a Server
  Action, Telegram delivery, honeypot handling, privacy-safe request keys, and
  Upstash-backed production rate limiting.
- Production SEO includes localized metadata, canonical and alternate URLs,
  sitemap and robots routes, structured data, and generated social images.
- CI covers formatting, linting, type checking, unit tests, production build,
  and Chromium E2E tests on desktop and mobile projects.

Some documentation can lag the implementation. At this snapshot, parts of the
README still describe Arabic and older directory paths as if they were not yet
migrated. The accepted architecture decision also contains historical
"current-file validation" examples. Use current source code and tests as the
technical truth; update documentation only when it is in the active task's
scope.

## Re-establish current status before every task

Never assume the snapshot above, an old ticket, or a previous agent report is
still current.

1. Run `git status --short`, `git branch --show-current`, `git remote -v`, and
   `git rev-parse HEAD`.
2. Preserve every pre-existing local change. Do not reset, clean, restore,
   overwrite, or stash user work without explicit permission.
3. Fetch `origin` when network access is available and compare the current base
   with `origin/main`.
4. Read the complete selected Notion ticket, including properties, body,
   dependencies, acceptance criteria, technical notes, and related tickets.
5. Verify the reported issue in current source and, when applicable, in the
   deployed site. A ticket is context, not proof.
6. Check whether relevant work has already merged or whether production is on a
   different commit. Distinguish local source, remote source, preview, and
   production behavior.

## Sources of truth

Use these sources in this order for technical decisions:

1. Current source code and tests on the latest applicable Git commit.
2. Reproduced local runtime behavior.
3. Verified preview or production behavior.
4. The active Notion ticket for agreed scope and acceptance criteria.
5. README and historical ticket text for background only.

Do not describe a source-only concern as a production bug unless it is observed
on the deployed site. Do not claim production matches a commit without checking
deployment evidence or behavior.

## Repository map

```text
content/
  articles/{en,de,ar}/       Local MDX case studies and remote-source indexes
  dictionaries/              Shared and contact-specific locale dictionaries
docs/architecture/           Accepted architecture decisions
public/                      Static images, flags, logos, and article assets
src/
  app/                       App Router pages, metadata, social images, sitemap
  components/                Page sections, navigation, SEO, MDX, and UI primitives
  features/articles/domain/  Article types, parsing, policy, and reading helpers
  features/articles/server/  Local/remote sources and article service composition
  features/contact/          Contact UI, schema, results, and server orchestration
  i18n/                      Locale types, routing, paths, alternates, and requests
  lib/config/                Typed environment and site/navigation configuration
  lib/                       Shared utilities and Telegram adapter/client
  styles/                    Global theme, MDX, responsive, and RTL typography CSS
tests/e2e/                   Playwright release and regression flows
.github/workflows/           Pull-request quality and E2E workflows
```

The long-term ownership and dependency rules are defined in
`docs/architecture/001-feature-oriented-structure.md`. Follow its
"move files when touched" policy. Do not perform mass folder migrations or
create speculative directories.

## Routes and localization

The route source is `src/app/[locale]`, and locale configuration lives in
`src/i18n`.

- `/{locale}`: portfolio home.
- `/{locale}/about`: profile and background.
- `/{locale}/articles`: published case-study listing.
- `/{locale}/articles/{slug}`: MDX article detail.
- `/{locale}/contact`: dedicated contact page.
- Unknown localized paths: localized not-found handling.
- `/sitemap.xml` and `/robots.txt`: framework metadata routes.

Localization invariants:

- `src/i18n/locale.ts` is the source of truth for published locales, default
  locale, and text direction.
- `src/i18n/routing.ts` uses `localePrefix: "always"`.
- Use the next-intl wrappers from `src/i18n/routing.ts` and path helpers from
  `src/i18n/paths.ts`; do not assemble locale URLs ad hoc.
- Preserve the current route and query string when switching language.
- Any user-visible copy must exist in every published locale unless the ticket
  explicitly changes locale availability.
- Test Arabic layout direction and mixed-direction content when changing shared
  UI or typography.

## Server and client boundaries

Server Components are the default. Add `"use client"` only when a component
requires browser state, effects, event handling, or a client-only library.

- Route files should compose features and own routing/metadata concerns, not
  reusable domain logic.
- Modules that access the filesystem, secrets, private environment variables,
  server compilation, privileged network clients, or request headers must stay
  server-only and normally include `import "server-only"`.
- Server Actions retain the `"use server"` directive.
- Never import server-only modules into client components or design-system
  primitives.
- Keep feature internals inside their owning feature. Promote code to shared
  layers only when it has a real second owner.
- Avoid broad barrel files and circular dependency patterns.

## Article and MDX system

The public article API is `src/features/articles/server/index.ts`. It composes a
local source and an optional remote source through the article service.

- `MDX_CONTENT_SOURCE` accepts `local`, `remote`, or `hybrid`.
- Local content is discovered under `content/articles/{locale}`.
- Remote configuration is parsed in
  `src/features/articles/server/article-env.ts`.
- Hybrid mode follows the explicit merge and fallback policies in the article
  domain/server tests; do not invent a second precedence rule.
- Article frontmatter is validated before use. Preserve production draft
  filtering and deterministic sorting.
- Article rendering is server-only and uses the trusted MDX pipeline in
  `src/components/mdx/mdx-renderer.tsx`.
- Referenced article assets belong under `public/articles/{slug}` and use
  root-relative URLs.
- When changing the content pipeline, test list and detail behavior, all
  published locales, malformed content, missing content, and production build
  tracing.

## Contact system

The contact feature is rooted at `src/features/contact`.

- `contact-schema.ts` is shared validation truth for browser and server paths.
- `server/submit-contact-form.ts` is the Server Action entry point.
- `server/submit-contact-form-handler.ts` owns validation result mapping and
  delivery orchestration.
- `server/contact-abuse-protection.ts` owns honeypot and rate-limit decisions.
- Telegram transport is isolated under `src/lib/telegram.ts` and
  `src/lib/telegram-client.ts`.
- Production requires Telegram credentials plus Upstash and rate-limit secret
  configuration. Development can use safe no-op/in-memory behavior.
- E2E safety flags work only with `CI=true`. Never weaken this guard or allow
  tests to deliver real Telegram messages.
- Never log or expose tokens, chat IDs, Redis credentials, rate-limit secrets,
  raw IP addresses, or local environment-file contents.
- Update `.env.example` whenever a task adds or changes environment variables;
  include placeholders and constraints, never secret values.

## Styling, UI, and accessibility

- Global theme and typography rules live in `src/styles/globals.css`; Arabic
  typography overrides live in `src/styles/rtl-typography.css`.
- Reuse existing shadcn/Radix primitives from `src/components/ui` before adding
  new abstractions.
- Preserve light, dark, and system-theme behavior.
- Keep interactive targets keyboard reachable, correctly named, and visibly
  focused.
- Maintain reduced-motion behavior for JavaScript and CSS animation.
- Check 320px mobile widths, the configured 390x844 mobile E2E viewport,
  tablet layouts, and 1440x900 desktop behavior for shared layout changes.
- Prevent page-level horizontal overflow, especially for MDX code blocks,
  tables, long German text, and bidirectional Arabic content.

## SEO and public behavior

When changing routes, locales, articles, or site identity, inspect all affected
SEO surfaces:

- Route metadata and canonical URLs.
- Locale alternates and `hreflang`.
- `src/app/sitemap.ts` and `src/app/robots.ts`.
- Article JSON-LD and other structured data.
- Open Graph and Twitter image routes.
- Preview indexing behavior controlled by the deployment environment.

Use production mode for metadata, sitemap, dynamic route, article rendering,
environment, and deployment-related verification.

## Notion ticket workflow

The private `marketing-website` database is the implementation board. Its main
workflow is:

`Backlog -> Ready -> In Progress -> QA / Verification -> Code Review -> Done`

`Blocked` is reserved for a concrete missing decision, asset, credential, or
external dependency.

Ticket families:

- `GH-*`: production behavior, content, design, responsive behavior,
  accessibility, SEO, localization, and release QA.
- `ARC-*`: architecture, boundaries, maintainability, testing, CI, security,
  and documentation.

Important properties include `Ticket`, `Ticket ID`, `Status`, `Priority`,
`Source`, `Milestone`, `Labels`, `Dependencies`, and `Order`.

- Query the board live; do not hard-code ticket status in repository docs.
- Read a ticket completely before editing code.
- Verify every dependency against merged code or the required external state.
- Modify only tickets and properties authorized by the user's current request.
- Keep a ticket in `In Progress` during investigation and implementation when
  that workflow is requested.
- Move to `QA / Verification` only after implementation is complete and before
  final verification.
- Move to `Code Review` only after all required checks pass and the requested
  remote delivery is verified.
- If verification, commit, or push fails, do not falsely advance the ticket.

## Git safety and scope control

Before editing:

```bash
git status --short
git branch --show-current
git remote -v
```

- Never implement on `main` or `master`.
- Start from the latest clean applicable base and create a dedicated branch.
- Follow an explicitly requested branch name. Otherwise use the repository's
  established `feat/`, `fix/`, `refactor/`, or `test/` convention; Codex-created
  maintenance branches may use the required `codex/` prefix.
- Preserve unrelated local changes and exclude them from the task commit.
- Never run destructive reset, clean, checkout, or restore commands to remove
  user work.
- Do not use `git stash` unless the user explicitly asks for it.
- Keep the diff limited to the selected ticket or request. New discoveries
  belong in separate follow-up work.
- Stage exact files, review the staged diff, and never commit secrets, `.env`
  files, build output, logs, screenshots, caches, or test artifacts unless an
  artifact is explicitly required.
- Do not push protected branches or force-push.
- Commit, push, open a pull request, merge, or update Notion only when the
  current request authorizes that action.

## Required verification

Install exact dependencies when needed:

```bash
pnpm install --frozen-lockfile
```

Run focused tests while developing, then run the full quality gate:

```bash
pnpm format:check
pnpm lint:ci
pnpm typecheck
pnpm test:ci
pnpm build
```

`pnpm check` runs those five gates in sequence. Do not claim any command passed
unless it was executed and its exit code was checked.

For behavior that crosses routes, devices, themes, locales, forms, articles,
or browser APIs, also run:

```bash
pnpm test:e2e
```

Playwright builds and starts the production application at
`http://127.0.0.1:3100` and runs desktop Chromium at 1440x900 plus mobile
Chromium at 390x844. Its configuration deliberately disables real Telegram
delivery and uses an in-memory rate limiter.

After automated checks, verify affected routes in a real browser when visual,
responsive, accessibility, navigation, theme, or runtime behavior matters.
Check direct navigation, client navigation, reload, console errors, failed
network requests, and server logs. Test every affected locale.

Before committing, review:

```bash
git branch --show-current
git status --short
git diff --check
git diff
```

Confirm the diff is scoped, no secrets or temporary artifacts were added, all
acceptance criteria are covered, and no ticket-related failure remains.

## Definition of done

A code task is complete only when:

- The current problem was reproduced or otherwise concretely verified.
- The smallest production-ready solution is implemented within scope.
- Regression tests cover the changed behavior.
- Formatting, lint, type checking, unit tests, and production build pass.
- Relevant integration and E2E/browser checks pass.
- Every acceptance criterion is reviewed against evidence.
- The final diff contains no unrelated work or sensitive data.
- Authorized Git and Notion workflow actions are completed and verified.
- Remaining unrelated failures or external blockers are reported accurately.

If the ticket is already fixed, outdated, duplicated, incorrect, or blocked,
do not invent code, create an empty commit, or advance its status. Report the
evidence and the exact next action required.
