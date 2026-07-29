# ghassan.de — LLM Brand & Design System Wiki

> Audited 2026-07-25 against the live site (https://ghassan.de) and the `marketing-website` source (Next.js 16, Tailwind CSS v4, shadcn/ui, Radix, Motion, next-intl).
> Single source of truth for any human or AI agent generating UI code or content for ghassan.de.

---

## 1. BRAND IDENTITY & VOICE

### Core purpose
Personal engineering brand for **Ghassan Aldarwish** — Backend Developer, DevOps Engineer & AI Developer based in Berlin, Germany. The site positions Ghassan for opportunities in Germany by demonstrating engineering depth: architecture diagrams, case studies about trade-offs, and production AI systems — not screenshot galleries.

Headline promise: **"Building AI Systems That Scale."**

### Tone of voice
- **Substance over flash.** "Instead of showing only screenshots, I present projects through architecture, trade-offs, implementation decisions, and lessons learned."
- **Confident, calm, first-person.** Short declarative sentences: "I design and build production-ready AI systems."
- **Systems-thinking framing.** Recurring theme: "Great software is not just about writing code." / "An engineer focused on systems, not just code."
- **No hype words.** No "ninja/rockstar/passionate". Value is expressed through concrete nouns: LLMs, RAG, MCP servers, Kubernetes, gRPC, observability.
- **Trilingual:** English (default), German, Arabic (full RTL support). German institutional terms stay as-is.

### Visual identity summary
- **Strictly monochrome.** Pure neutral grayscale (zero chroma) in both themes; the only chromatic color is the destructive red for errors. No brand accent hue exists — hierarchy is created with weight, size, and subtle foreground-alpha tints.
- **Light & dark themes** (system default; class-based toggle; hidden `d` keyboard shortcut toggles theme).
- **Developer-culture motifs:** a fake macOS terminal window ("Ghassans-Macbook — bash") in the hero, grid-line backgrounds, code-styled article rendering (Shiki dual-theme), architecture diagrams.
- **Logo:** wordmark PNGs `light_logo_500_180.png` / `dark_logo_500_180.png` (theme-swapped), paired with bold "Ghassan" text.

### Key brand keywords
`AI Engineering` · `Backend Architecture` · `Cloud & DevOps` · `Production-ready` · `Scalable` · `LLMs / Agents / RAG / MCP` · `Node.js / TypeScript / Python` · `Docker / Kubernetes` · `Berlin, Germany` · `7+ Years Experience`

---

## 2. COLOR PALETTE

All colors are defined as OKLCH CSS variables in `src/styles/globals.css` (shadcn/ui token model). The grayscale ramp maps exactly to Tailwind's `neutral` scale.

### Neutral ramp (the entire brand palette)

| Token value | Hex | ≈ Tailwind |
|---|---|---|
| `oklch(1 0 0)` | `#ffffff` | white |
| `oklch(0.985 0 0)` | `#fafafa` | neutral-50 |
| `oklch(0.97 0 0)` | `#f5f5f5` | neutral-100 |
| `oklch(0.922 0 0)` | `#e5e5e5` | neutral-200 |
| `oklch(0.87 0 0)` | `#d4d4d4` | neutral-300 |
| `oklch(0.708 0 0)` | `#a1a1a1` | neutral-400 |
| `oklch(0.556 0 0)` | `#737373` | neutral-500 |
| `oklch(0.439 0 0)` | `#525252` | neutral-600 |
| `oklch(0.371 0 0)` | `#404040` | neutral-700 |
| `oklch(0.269 0 0)` | `#262626` | neutral-800 |
| `oklch(0.205 0 0)` | `#171717` | neutral-900 |
| `oklch(0.145 0 0)` | `#0a0a0a` | neutral-950 |

### Semantic tokens

| Token | Light | Dark |
|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` |
| `--foreground` | `#0a0a0a` | `#fafafa` |
| `--card` / `--popover` | `#ffffff` / `#ffffff` | `#171717` / `#171717` |
| `--primary` | `#171717` | `#e5e5e5` |
| `--primary-foreground` | `#fafafa` | `#171717` |
| `--secondary` / `--muted` / `--accent` | `#f5f5f5` | `#262626` |
| `--muted-foreground` | `#737373` | `#a1a1a1` |
| `--accent-foreground` | `#171717` | `#fafafa` |
| `--destructive` | `#e7000b` (oklch 0.577 0.245 27.3) | `#ff6467` (oklch 0.704 0.191 22.2) |
| `--border` / `--input` | `#e5e5e5` | `white/10` / `white/15` |
| `--ring` | `#a1a1a1` | `#737373` |

Alpha tints used compositionally (not tokens): `bg-foreground/2` (section tint), `bg-foreground/4-5` (card hover), `border-foreground/20` (card hover border), `text-foreground/60 → /80` (social icons), `bg-background/50` (frosted navbar), `ring-foreground/10` (card ring).

### Usage rules
- **Backgrounds:** page = `background`; alternating "zebra" sections = `bg-foreground/2` with `border-y`; cards = `bg-card` + `ring-foreground/10`.
- **Text:** headings and body = `text-foreground`; supporting/lead paragraphs and metadata = `text-muted-foreground`; never place `muted-foreground` on `muted` backgrounds for essential copy.
- **Interactive emphasis** = `primary` (near-black on light, near-white on dark). Inverted automatically per theme — never hardcode.
- **Red (`destructive`) is exclusively for errors/destructive actions.** Never decorative.
- **Selection** = `primary` at 22% mix; **focus ring** = `--ring` (2px, offset 3px) or component `ring-3 ring-ring/50`.
- **Never introduce a new hue** (blue links, colored badges, gradients). Monochrome is the brand.

---

## 3. TYPOGRAPHY & TEXT STYLES

### Font families (next/font, `display: swap`)

| Role | Font | CSS variable | Fallback |
|---|---|---|---|
| Sans + headings | **Inter** | `--font-inter` → `--font-sans`, `--font-heading` | next/font size-adjusted fallback + Tailwind default stack (ui-sans-serif, system-ui, …) |
| Monospace | **Geist Mono** | `--font-geist-mono` → `--font-mono` | ui-monospace, SFMono-Regular, … |
| Arabic (RTL) | **Noto Sans Arabic** (400/500/600/700) | `--font-arabic` | sans-serif |

One family does everything; hierarchy comes from size/weight, not typeface changes. For `ar` locale, `rtl-typography.css` swaps sans/heading to Noto Sans Arabic, raises body line-height to 1.75 (prose 1.9), and neutralizes `uppercase`/`tracking-*` (Arabic has no letterspacing or capitals).

### Scale hierarchy (as used — Tailwind classes)

| Element | Classes | Rendered |
|---|---|---|
| **H1 (page hero)** | `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance` | 36 → 48 → 60px |
| **H2 (section)** | `text-4xl sm:text-5xl font-semibold tracking-tight` | 36 → 48px |
| **H3 (card title)** | `text-2xl font-semibold` | 24px |
| **Eyebrow/kicker** | `text-sm font-medium tracking-widest uppercase text-accent-foreground mb-3` | 14px |
| **Lead paragraph** | `text-lg leading-8 text-muted-foreground mt-6` | 18px / 32px |
| **Hero description** | `text-lg sm:text-xl leading-relaxed` | 18 → 20px |
| **Body / UI default** | `text-sm` (components) / `text-base` | 14 / 16px |
| **Caption / meta** | `text-sm text-muted-foreground` or `text-xs font-medium` (badges) | 14 / 12px |
| **Code blocks** | Geist Mono `0.875rem`, `line-height: 1.7` | inline code `0.875em`, weight 500, on `muted` w/ border |

Notes: root font-size stays at browser default 16px (deliberate — documented in globals.css). Article prose uses `@tailwindcss/typography` with pseudo-quotes on `code` removed. Headings H2–H4 get hover-revealed `#` anchor links (`.heading-anchor`, always 65% visible on touch devices).

### Standard section header pattern (reuse verbatim)

```tsx
<p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">{eyebrow}</p>
<h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
<p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>
```

---

## 4. UI COMPONENTS & LAYOUT SYSTEM

Component library: **shadcn/ui-style** CVA components in `src/components/ui/` (button, badge, card, input, dialog, sheet, alert, field, dropdown-menu, sonner toasts) + custom `Terminal`, `FloatingNav`, `GridBackground`.

### Radius tokens — base `--radius: 0.325rem` (5.2px)

| Token | Value | Used by |
|---|---|---|
| `sm / md / lg` | 3.1 / 4.2 / 5.2px | buttons (`rounded-lg`), inputs, alerts |
| `xl` | 7.3px | Card default, code blocks, navbar (desktop) |
| `2xl / 3xl` | 9.4 / 11.4px | icon tiles / article cards & timeline entries |
| `4xl` | 13.5px | Badge (pill) |

### Buttons (`button.tsx`)
- Base: `inline-flex rounded-lg text-sm font-medium transition-all select-none`, `active:translate-y-px` (press-down), `disabled:opacity-50`, focus = `border-ring + ring-3 ring-ring/50`, SVG icons auto `size-4`.
- Variants: `default` (`bg-primary`, hover `bg-primary/80`), `outline` (border + `bg-background`, hover `bg-muted`; dark: `bg-input/30`), `secondary`, `ghost`, `destructive` (soft `bg-destructive/10 text-destructive`), `link` (underline on hover, `underline-offset-4`).
- Sizes: `xs h-6` / `sm h-7` / `default h-8 px-2.5` / `lg h-9` / icon variants `size-6/7/8/9`. Hero CTAs override to `min-h-11 text-lg`.

### Badges (`badge.tsx`)
`h-5 rounded-4xl px-2 text-xs font-medium` pill; variants mirror buttons. Used for tech-stack chips on expertise/project cards (typically `secondary`/`outline`).

### Cards (`card.tsx`)
`rounded-xl bg-card text-sm ring-1 ring-foreground/10`, internal spacing via `--card-spacing` (16px; `size="sm"` = 12px). Feature-card hover recipe: `transition hover:-translate-y-1 hover:bg-foreground/5` (article cards add `duration-300 group-hover:border-foreground/20` and image `scale-[1.03] duration-500`). Icon tile inside cards: `h-12 w-12 rounded-2xl border bg-accent-foreground/10 text-accent-foreground` with `h-6 w-6` Lucide icon.

### Inputs (`input.tsx`)
`h-11 rounded-lg border-input bg-transparent px-3 py-2 text-base md:text-sm` (16px on mobile prevents iOS zoom); dark `bg-input/30`; focus `border-ring ring-3 ring-ring/50`; invalid `border-destructive ring-destructive/20`.

### Navigation
- **Navbar:** `FloatingNav` — fixed, `max-w-6xl`, frosted glass (`bg-background/50 backdrop-blur-md`), `h-10` mobile / `h-12 lg:rounded-xl` desktop floating pill centered `top-2`. Hides on scroll-down, reappears on scroll-up or near top (<50px); Motion spring 0.2s; respects `prefers-reduced-motion`. Contains logo + wordmark, links, `ModeToggle`, `LanguageToggle`; mobile = Sheet menu.
- **Footer:** `border-t`, `GridBackground`, `max-w-6xl`; logo + copyright + email, nav links as `link`-variant buttons (`text-xl`), social icons `size-10 text-foreground/60 hover:text-foreground/80` with `aria-label`.

### Layout & spacing tokens
- **Container:** `mx-auto max-w-6xl` (1152px) — the site-wide standard. Article detail: `max-w-4xl` (reading width). Section header copy constrained to `max-w-3xl`.
- **Gutters:** home sections `px-2 lg:px-0`; about `px-6`; article `px-4 sm:px-6`. (Inconsistent — see §5.)
- **Vertical rhythm:** every section `py-12 lg:py-24`; header block → content `mt-12`; CTA block `mt-8`.
- **Grids:** cards `grid gap-6 md:grid-cols-2`; tech logos `grid-cols-5 md:grid-cols-8 xl:grid-cols-12 gap-6/8`.
- **Zebra sections:** alternate plain background with `border-y bg-foreground/2`.
- **Scroll:** `scroll-behavior: smooth`, `scroll-padding-top: 6rem` (fixed-nav offset); full reduced-motion kill-switch for all animations.

---

## 5. VISUAL & UI AUDIT (Bugs & Inconsistencies)

Ordered by impact. File references are exact.

1. **Hero H1 is missing its weight/tracking** — `components/hero/Hero.tsx:32` has only `text-4xl sm:text-5xl lg:text-6xl`. Tailwind preflight resets headings to weight 400, so the most important heading on the site renders *regular* while every other H1/H2 is `font-semibold tracking-tight`. **Fix:** add `font-semibold tracking-tight text-balance` (or document "light hero" as intentional — currently it reads as an accident next to the About/Contact H1s).
2. **`role="alert"` misused as CTA container** — `FinalCTA.tsx` wraps the "Let's build something exceptional" section in `<Alert>` (`alert.tsx` hardcodes `role="alert"`), making screen readers announce marketing copy as an assertive live region. **Fix:** use a plain styled `<section>`/`<div>`.
3. **Near-invisible tint, likely a typo** — `FinalCTA.tsx`: `bg-muted-foreground/1` = 1% alpha (imperceptible). Probably meant `bg-muted-foreground/10` or the standard `bg-foreground/2`. **Fix:** align with the zebra-section token.
4. **Container-width drift** — About page mixes `max-w-6xl` (intro, `page.tsx:199`) and `max-w-7xl` (journey, `page.tsx:219`) on the same page; FinalCTA uses `max-w-5xl`; the sections visibly misalign at ≥1280px. **Fix:** standardize on `max-w-6xl` (keep `max-w-4xl` only for article prose).
5. **Mobile gutter inconsistency (and 8px is too tight)** — home uses `px-2`, about `px-6`, articles `px-4 sm:px-6`. Content nearly touches the viewport edge on the homepage. **Fix:** one token, recommend `px-4 sm:px-6` everywhere.
6. **H1 weight drift on article detail** — `articles/[slug]/page.tsx:326` uses `font-bold`; all other H1s use `font-semibold`. Pick one (semibold).
7. **Double focus indicator** — globals.css sets a global `:focus-visible` outline (2px `--ring`, offset 3) *and* components add `focus-visible:ring-3` box-shadows → buttons/inputs show outline + ring simultaneously. **Fix:** components that define their own ring should also set `focus-visible:outline-none`, or drop the global rule in favor of component rings.
8. **Touch targets / control-height mismatch** — default Button is `h-8` (32px) while Input is `h-11` (44px): side-by-side forms misalign, and 32px is below the 44px touch-target guideline. Hero already patches this ad-hoc (`min-h-11`). **Fix:** make `lg`/44px the default for standalone CTAs and form submits.
9. **"Accent" token carries no accent** — eyebrows, category labels, and icon tiles use `text-accent-foreground`, which is visually identical to `foreground` in this monochrome theme. Harmless today, but semantically fragile: any future re-theme of `--accent-*` will silently recolor half the site. **Fix:** either use `text-foreground`/`text-muted-foreground` explicitly, or formally designate `--accent-*` as the future brand-accent slot.
10. **Stray off-brand blue** — dark-mode `--sidebar-primary: oklch(0.488 0.243 264.376)` (`#1447e6`) is a leftover shadcn default; sidebar tokens are otherwise unused (no sidebar component). **Fix:** delete the sidebar token block or neutralize the blue before anything ever consumes it.
11. **Radius overrides everywhere** — base `--radius` 0.325rem is small, so feature surfaces routinely override (`rounded-3xl` article cards & timeline vs `rounded-xl` Card default vs `rounded-2xl` icon tiles). **Fix:** decide the card radius (xl vs 3xl), encode it in `card.tsx`, stop overriding per-page.
12. **Brand-title inconsistency across pages** — homepage metadata: "Backend Developer, DevOps Engineer & Junior AI Developer"; About metadata: "AI Engineer and Backend Engineer". Also "Junior AI Developer" sits oddly next to "7+ Years Experience" hero metrics. **Fix:** pick one canonical role string, use it in every `metadata.*` namespace and structured data.
13. **Footer email is plain text, not a link** — `Footer.tsx` renders `info@ghassan.de` as text with a full-size (24px) `Mail` icon beside 14px text (Cloudflare then rewrites it to an obfuscation link, which is why the live site shows `[email protected]`). **Fix:** `<a href="mailto:info@ghassan.de">` + `size-4` icon.
14. **Selected Projects grid has one item** — the case-study grid renders a single card, leaving the section visually unbalanced on desktop. Fix by content (add case studies) or collapse to a single featured layout until then.
15. **Legacy naming in content model** — i18n key `home.hero.infiniteMovingCards` now feeds a static metrics list (leftover from a marquee component). Rename to `hero.metrics` on the next content-schema pass.
16. **Logo is raster** — 500×180 PNGs for a wordmark; slightly soft on high-DPI. Export SVG (theme-adaptive via `currentColor` if possible).

Solid foundations worth calling out: full RTL/Arabic typography layer, `prefers-reduced-motion` kill-switch, dual-theme Shiki code blocks, `aria-label`ed icon links, e2e/content-check/deadcode CI scripts, and consistent `data-testid` hooks.

---

## 6. LLM DESIGN SYSTEM RULES (Agent Instructions)

### MUST DO
1. **MUST use semantic tokens only** (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `ring-ring`…). Both themes come free; hardcoded grays break dark mode.
2. **MUST keep the palette monochrome.** Neutral grayscale + `destructive` red for errors. No new hues, no gradients, no colored badges.
3. **MUST reuse the section skeleton:** `<section class="py-12 lg:py-24">` → `mx-auto max-w-6xl` container → eyebrow (`text-sm font-medium tracking-widest uppercase`) → H2 (`text-4xl sm:text-5xl font-semibold tracking-tight`) → lead (`mt-6 text-lg leading-8 text-muted-foreground`) → content at `mt-12`. Alternate sections with `border-y bg-foreground/2`.
4. **MUST use existing `src/components/ui/*` primitives** (Button, Badge, Card, Input, Dialog, Sheet, Field) via their variants — never restyle from scratch. Icons: **lucide-react only**, `size-4` in buttons, `h-6 w-6` in icon tiles.
5. **MUST route all user-facing strings through next-intl** dictionaries (`content/dictionaries/{en,de,ar}.json`) — never hardcode copy in TSX; test RTL when touching layout (use logical properties: `ms-*`, `pe-*`, `text-start`, `rtl:rotate-180` on directional arrows).
6. **MUST preserve accessibility invariants:** visible focus ring on every interactive element, `aria-label` on icon-only links/buttons, `aria-hidden` on decorative SVGs, `prefers-reduced-motion` respected for any new animation, alt text on images.
7. **MUST use Inter for all text and Geist Mono for code** via `font-sans`/`font-mono` variables; hierarchy via size + weight (medium/semibold), `tracking-tight` on display headings.
8. **MUST keep motion subtle and fast:** hover = `-translate-y-1` + background tint (150–300ms), press = `translate-y-px`, image zoom ≤ `scale-[1.03]`. Motion (framer) only for nav/entrance, always gated on `useReducedMotion`.
9. **MUST write in the brand voice:** first person, concrete, systems-focused, hype-free. Case studies lead with the problem and trade-offs, not features.
10. **MUST keep `data-testid` attributes** on new interactive sections (Playwright e2e depends on them) and run `pnpm check` before shipping.

### NEVER DO
1. **NEVER introduce a chromatic color** (blue links, green success chips, brand gradients). If it needs emphasis, use weight, size, `primary`, or a foreground-alpha tint.
2. **NEVER use `role="alert"`, live regions, or heading tags for decoration** — headings must follow document outline (one H1 per page, H2 sections, H3 cards).
3. **NEVER hardcode hex/oklch values, `dark:` one-off colors, or `text-white`/`text-black`** in components — tokens only.
4. **NEVER add fonts or icon sets** (no Font Awesome, no serif display face, no emoji as UI icons).
5. **NEVER exceed the container system:** no `max-w-7xl`, no full-bleed text; prose stays ≤ `max-w-4xl`, header copy ≤ `max-w-3xl`.
6. **NEVER use physical direction utilities** (`ml-*`, `pl-*`, `left-*`, `text-left`) where a logical equivalent exists — Arabic RTL will break.
7. **NEVER animate layout on scroll-jacking, autoplay marquees without pause, or anything ignoring `prefers-reduced-motion`.**
8. **NEVER invent facts about Ghassan** (years of experience, employers, metrics, titles). Source claims from existing dictionary content; when uncertain, ask.
9. **NEVER use `localStorage`-dependent theming or inline styles for theme values** — theming is class-based via next-themes (`.dark` on `<html>`).
10. **NEVER bypass the content pipeline:** articles are MDX in `content/articles/` with frontmatter validated by `scripts/content-check.ts`; images go through `next/image` with explicit `sizes`.

---

*Maintenance note: update §5 as issues are fixed, and §2/§4 if `globals.css` tokens change. This file should co-evolve with the codebase.*
