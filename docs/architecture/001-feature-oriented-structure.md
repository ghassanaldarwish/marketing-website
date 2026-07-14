# ADR 001: Feature-oriented structure and ownership

- Status: Accepted
- Date: 2026-07-14
- Decision owners: Repository maintainers

## Context

The current repository groups some code by technical type (`actions`, `hooks`,
`lib`) and some code by subject (`contact`, `navbar`, `mdx`). Without explicit
ownership rules, incremental refactors can create duplicate helpers, ambiguous
shared folders, and large file-moving pull requests.

This decision defines the target direction. It does not authorize a mass move
or the creation of empty folders.

## Decision

Use feature ownership for application behavior and retain focused shared areas
for framework routes, design-system primitives, configuration, localization,
and framework-agnostic utilities.

```text
src/
├── app/                         # Next.js routes, layouts, metadata and route files
├── features/
│   ├── articles/                # Article-specific UI, server logic and domain helpers
│   │   ├── components/
│   │   ├── server/
│   │   └── lib/
│   ├── contact/                 # Contact UI, validation and server orchestration
│   │   ├── components/
│   │   ├── server/
│   │   └── lib/
│   └── navigation/              # Site-wide navigation composition and behavior
│       ├── components/
│       └── lib/
├── components/
│   ├── ui/                      # Design-system primitives only
│   └── shared/                  # Composed, cross-feature presentation components
├── config/                      # Static application configuration
├── i18n/                        # next-intl routing, request and navigation setup
├── lib/                         # Framework-agnostic shared utilities and infrastructure
├── services/                    # External-system adapters and integration clients
└── styles/                      # Global styles and design tokens
```

Only create a directory when a real file needs it. Existing files move toward
this structure when they are already being changed for a product or maintenance
reason.

## Ownership rules

### `app`

`app` owns Next.js routing concerns: `page.tsx`, `layout.tsx`, `loading.tsx`,
`error.tsx`, `not-found.tsx`, route handlers, metadata, sitemap, robots, and
social-image route files. Route files compose features but should not contain
reusable domain logic.

Next.js route files retain the default exports required by the framework.

### `features/<feature>`

A feature owns behavior that serves one product capability. Keep its components,
validation, feature-specific helpers, and server orchestration together.

- `components/`: feature-owned React components.
- `server/`: Server Actions, server-only repositories and orchestration.
- `lib/`: pure logic used only by that feature.

Features may import shared layers. One feature must not reach into another
feature's internal folders. Cross-feature APIs should be deliberately promoted
to a shared layer or exposed through a small feature public entry point.

### `components/ui`

This folder contains reusable design-system primitives such as buttons, inputs,
dialogs, cards, and field building blocks. A primitive must not know about
articles, contact delivery, navigation labels, routes, or business rules.

Generated or adapted shadcn/Radix primitives remain here.

### `components/shared`

This folder contains composed presentation components reused by multiple
features but without feature-specific business behavior. A component used by
only one feature stays inside that feature.

### `config`

Static, typed application configuration belongs here: site metadata, navigation
item definitions, feature flags, and other declarative settings. Configuration
must not perform network or filesystem I/O.

### `i18n`

`i18n` owns `next-intl` routing, request configuration, locale-aware navigation
wrappers, and locale types that directly support localization. Translation
content remains under `content/dictionaries`.

### `lib`

`lib` contains shared, framework-agnostic utilities, schemas, parsers, and
infrastructure helpers. Prefer pure functions. Code here must not import from
`app`, feature UI, or React components.

A domain-specific helper belongs in its feature until at least two independent
owners need the same abstraction.

### `services`

`services` contains adapters for external systems such as Telegram or a remote
content origin. Services expose typed operations and isolate transport details.
They do not own page rendering or form state.

## Concrete placement examples

| New code | Location | Reason |
| --- | --- | --- |
| Article frontmatter/parser logic used only by articles | `src/features/articles/lib/` | Article-domain logic |
| Generic MDX compiler infrastructure reused outside articles | `src/lib/mdx/` | Shared infrastructure |
| New contact form field and its UI | `src/features/contact/components/` | Contact-owned presentation |
| Contact submission orchestration | `src/features/contact/server/` | Server-only feature behavior |
| Site-wide navbar item definition | `src/config/navigation.ts` | Static application configuration |
| Navbar rendering and interaction | `src/features/navigation/components/` | Navigation feature behavior |
| Generic button, input, or dialog primitive | `src/components/ui/` | Design-system primitive |
| Telegram API adapter | `src/services/telegram/` | External-system integration |

## Dependency direction

Allowed dependency direction is:

```text
app -> features -> components/shared -> components/ui
  \       |               |
   \      +-------> config, i18n, lib, services
    +-------------> config, i18n, lib
```

Additional rules:

- `app` may compose any lower layer.
- Features may import `components/shared`, `components/ui`, `config`, `i18n`,
  `lib`, and `services`.
- `components/shared` may import `components/ui`, `config`, `i18n`, and pure
  `lib` utilities, but not feature internals.
- `components/ui` must not import from `app`, `features`, or `services`.
- `lib` and `config` must remain framework-agnostic unless their folder name
  explicitly identifies framework infrastructure, such as `lib/mdx`.
- `services` must not import React components or route modules.
- Avoid circular imports and avoid barrel files that hide dependency direction.

## Server-only rules

- Put feature-owned server code in `features/<feature>/server`.
- Put shared external adapters in `services` and shared server infrastructure in
  an explicitly named `lib/*` module.
- Add `import "server-only"` to modules that access secrets, the filesystem,
  private environment variables, privileged network clients, or server-only
  compilation APIs.
- Server Actions retain the `"use server"` directive.
- Do not import server-only modules from files marked `"use client"` or from
  design-system primitives.
- Use descriptive names such as `submit-contact-form.ts`,
  `article-repository.ts`, and `telegram-client.ts`; do not rely on a generic
  `server.ts` file.

## Naming and exports

- New file and folder names use lowercase kebab-case.
- React component symbols and types use PascalCase.
- Functions and variables use camelCase.
- Constants use camelCase unless they are true process-wide constants where
  uppercase improves clarity.
- Internal modules use named exports.
- Default exports are allowed where Next.js requires them and for established
  framework integration points. Existing default component exports may remain
  until the file is touched for meaningful work.
- Avoid broad `index.ts` barrels. A narrow public entry point is acceptable when
  it makes a feature boundary explicit without creating cycles.

## Migration policy

Use **move files when touched**:

1. Do not open an initial mass-move pull request.
2. Move a file only when the active ticket already changes its behavior or
   ownership.
3. Keep each move inside that ticket's scope and update all imports and tests.
4. Run formatting, lint, type-checking, tests, and the production build.
5. Do not create empty target folders in anticipation of future work.
6. When an older ticket names a path that conflicts with this ADR, follow this
   ADR and document the resolved path in the pull request.

## Rejected alternatives

### Mass folder migration

Rejected because it produces a large diff with little user value, increases
merge conflicts, and makes regressions harder to isolate.

### One folder per technical type

Rejected as the long-term target because separate global folders for actions,
components, hooks, schemas, and helpers scatter one feature across the tree.

### A folder for every component

Rejected because it adds nesting without establishing ownership. Add a folder
when a component has meaningful colocated tests, styles, subcomponents, or
feature logic.

### Premature shared abstractions

Rejected because code should not move into `shared`, `lib`, or `services` merely
because it might be reused later. Promote it after a real second owner appears.

### Repository-wide barrel exports

Rejected because they hide dependency direction, make cycles easier, and blur
server/client boundaries.

## Review checklist

When reviewing a new or moved file, confirm:

- The owning route, feature, shared layer, or service is clear.
- The dependency direction follows this ADR.
- Server-only code cannot enter a client bundle.
- Naming follows kebab-case files and PascalCase component symbols.
- A move is connected to the ticket's actual work rather than folder cleanup.
- No empty or speculative directories were introduced.

## Current-file validation

This decision was checked against these current files:

- `src/app/[locale]/layout.tsx`: remains route composition under `app`.
- `src/actions/contact.ts`: moves to `features/contact/server` when contact work
  next changes it.
- `src/components/navbar/Navbar.tsx`: moves to
  `features/navigation/components` when navigation work touches it.
- `src/components/ui/button.tsx`: remains a design-system primitive.
- `src/i18n/routing.ts`: remains localization infrastructure under `i18n`.
- `src/lib/mdx/get-article.ts`: article-specific repository behavior can move
  toward `features/articles/server`; generic MDX infrastructure remains in
  `lib/mdx`.
- `src/lib/config/navigation.ts`: moves to `config/navigation.ts` when touched.

The target paths are compatible with the existing `@/* -> ./src/*` TypeScript
alias, Next.js App Router conventions, and the configured `next-intl` request
module at `src/i18n/request.ts`.

## Consequences

Positive consequences:

- New files have a predictable owner.
- Feature changes require fewer cross-repository edits.
- Server/client boundaries become easier to review.
- Refactoring can proceed incrementally with small diffs.

Trade-offs:

- The repository will temporarily contain both legacy and target paths.
- Reviewers must apply the ownership rules consistently.
- Automated boundary enforcement remains future work.