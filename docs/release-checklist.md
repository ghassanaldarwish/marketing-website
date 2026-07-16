# Release checklist

Use this checklist for a production release or a change that affects public
routes, content, localization, contact delivery, metadata, or deployment.
Record the tested commit SHA and preview URL with the release evidence.

## Repository and CI

- [ ] Start from the latest clean `main`; review the final diff for unrelated
      files, credentials, build output, logs, screenshots, and test artifacts.
- [ ] Install with pinned pnpm and the frozen lockfile:
      `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm content:check` and confirm EN, DE, and AR pass.
- [ ] Run `pnpm check` and record formatting, lint, dead-code, type, unit,
      content, production-build, and article-trace results.
- [ ] Run `pnpm test:e2e` and record desktop Chromium (`1440×900`) and mobile
      Chromium (`390×844`) results.
- [ ] Confirm the GitHub quality and E2E workflows pass for the exact release
      commit.

## Content and localization

- [ ] Review Home, About, Articles, every published article detail, Contact,
      and localized 404 routes in EN, DE, and AR.
- [ ] Confirm no draft, duplicate, placeholder, wrong-locale, or leading
      delimiter content is published.
- [ ] Verify article cover assets, internal links, project links, social links,
      and approved external destinations.
- [ ] Check long German copy and Arabic RTL layout at `320×568`, `360×800`,
      `390×844`, `768×1024`, `1024×768`, `1280×800`, and `1440×900` where the
      changed UI is relevant.
- [ ] Check mixed Arabic/LTR code, URLs, dates, and technology names; confirm
      code blocks and tables scroll without page-level horizontal overflow.

## Accessibility and interaction

- [ ] Test mouse, touch, and keyboard-only navigation, including the mobile
      sheet, language switcher, theme menu, dialogs, forms, and article links.
- [ ] Confirm every interactive element has an accessible name, visible focus,
      and a logical focus order.
- [ ] Test light, dark, system-light, and system-dark themes.
- [ ] Test normal and reduced-motion preferences; nonessential motion must be
      suppressed for reduced motion.
- [ ] Confirm no site-originated console errors or failed application requests
      occur during direct navigation, client navigation, and reload.

## SEO and public endpoints

- [ ] Inspect titles, descriptions, canonical URLs, Open Graph/Twitter data,
      and `hreflang`/`x-default` alternates for all affected locales.
- [ ] Validate article and page JSON-LD against the rendered page content.
- [ ] Check `/sitemap.xml` contains every published localized route and no
      draft or missing article.
- [ ] Check `/robots.txt`: production is indexable and previews are blocked.
- [ ] Open generated social images for affected pages and article routes.

## Contact delivery and abuse protection

- [ ] Confirm production has `TELEGRAM_BOT_TOKEN`, `GROUP_CHAT_ID`,
      `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and
      `CONTACT_RATE_LIMIT_SECRET`; never copy their values into evidence.
- [ ] Submit valid and invalid Contact forms in EN, DE, and AR and verify
      localized field, success, failure, and retry-later feedback.
- [ ] Confirm the honeypot does not deliver, per-request and global rate limits
      fail safely, and logs contain no email, message, secret, or raw address.
- [ ] Verify the approved production test reaches the intended Telegram
      destination exactly once. Do not weaken the `CI=true` E2E safety guard.

## Preview approval and deployment

- [ ] Test one preview built from the exact release commit; attach the preview
      URL, commit SHA, representative desktop/mobile screenshots in both
      themes, and console/network notes.
- [ ] Confirm preview environment variables select the intended content source
      and preview robots policy.
- [ ] Verify every P0/P1 defect found during QA is resolved and retested on the
      same preview commit.
- [ ] Deploy that reviewed commit to production and repeat smoke checks for
      localized navigation, one article, sitemap, robots, and Contact.

## Rollback and documentation

- [ ] Identify the last known-good deployment and retain its commit SHA before
      promotion.
- [ ] If smoke checks fail, stop further changes, restore the last known-good
      deployment through the hosting provider, and verify the public routes and
      contact integration again.
- [ ] Record the failure, affected deployment, rollback target, and follow-up
      ticket without including secrets or contact content.
- [ ] Update README, this checklist, the content guide, and `AGENTS.md` whenever
      the implemented architecture, commands, environments, or operating rules
      change. Do not edit historical ADR context merely to hide prior state.
