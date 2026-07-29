import { expect, test } from "@playwright/test"

const compactViewports = [
  { width: 320, height: 800, portraitMaxHeight: 320 },
  { width: 360, height: 800, portraitMaxHeight: 320 },
  { width: 390, height: 844, portraitMaxHeight: 320 },
  { width: 768, height: 1024, portraitMaxHeight: 480 },
] as const

const fullPageViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const

const portraitViewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const

test.describe("responsive Hero", () => {
  for (const { locale, label } of [
    { locale: "en", label: "View Engineering" },
    { locale: "de", label: "Engineering ansehen" },
    { locale: "ar", label: "استكشاف الأعمال الهندسية" },
  ] as const) {
    test(`${locale} exposes the primary localized Engineering action`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`)

      const action = page.getByTestId("hero-engineering-action")
      const heading = page.getByTestId("hero-heading")

      await expect(action).toBeVisible()
      await expect(action).toHaveAccessibleName(label)
      await expect(action).toHaveAttribute("href", `/${locale}/articles`)
      await expect(heading).toHaveClass(/font-semibold/)
      await expect(heading).toHaveClass(/tracking-tight/)
      await expect(heading).toHaveClass(/text-balance/)

      await action.focus()
      await expect(action).toBeFocused()
    })
  }

  for (const locale of ["en", "de", "ar"] as const) {
    test(`${locale} points the portrait toward its Hero copy`, async ({
      page,
    }) => {
      for (const viewport of portraitViewports) {
        await page.setViewportSize(viewport)
        await page.goto(`/${locale}`)

        const portrait = page.getByTestId("hero-portrait")
        await expect(portrait).toBeVisible()

        const rendering = await portrait.evaluate((image) => {
          const root = document.documentElement
          const box = image.getBoundingClientRect()
          const transform = getComputedStyle(image).transform
          const matrix = transform === "none" ? null : new DOMMatrix(transform)

          return {
            scaleX: matrix?.a ?? 1,
            insideViewport: box.left >= 0 && box.right <= root.clientWidth,
            pageOverflows: root.scrollWidth > root.clientWidth,
          }
        })

        expect(rendering.scaleX).toBe(locale === "ar" ? -1 : 1)
        expect(rendering.insideViewport).toBe(true)
        expect(rendering.pageOverflows).toBe(false)
      }
    })
  }

  for (const locale of ["en", "de", "ar"] as const) {
    for (const colorScheme of ["light", "dark"] as const) {
      test(`${locale} has no full-page overflow in ${colorScheme} mode`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme })

        for (const viewport of fullPageViewports) {
          await page.setViewportSize(viewport)
          await page.goto(`/${locale}`)

          const layout = await page.evaluate(() => {
            const root = document.documentElement
            const finalCta = document.querySelector<HTMLElement>(
              '[data-testid="final-cta"]'
            )
            const finalCtaHeading = document.querySelector<HTMLElement>(
              '[data-testid="final-cta-heading"]'
            )
            const finalCtaDescription = document.querySelector<HTMLElement>(
              '[data-testid="final-cta-description"]'
            )
            const finalCtaAction = document.querySelector<HTMLElement>(
              '[data-testid="final-cta-action"]'
            )

            if (
              !finalCta ||
              !finalCtaHeading ||
              !finalCtaDescription ||
              !finalCtaAction
            ) {
              throw new Error("Expected the final CTA to render")
            }

            const isInsideViewport = (element: HTMLElement) => {
              const box = element.getBoundingClientRect()
              return box.left >= 0 && box.right <= root.clientWidth
            }

            return {
              rootClientWidth: root.clientWidth,
              rootScrollWidth: root.scrollWidth,
              ctaInsideViewport: [
                finalCta,
                finalCtaHeading,
                finalCtaDescription,
                finalCtaAction,
              ].every(isInsideViewport),
            }
          })

          expect(layout.rootScrollWidth).toBeLessThanOrEqual(
            layout.rootClientWidth
          )
          expect(layout.ctaInsideViewport).toBe(true)
        }
      })
    }
  }

  for (const locale of ["en", "de", "ar"] as const) {
    test(`names and secures the ${locale} social links`, async ({ page }) => {
      await page.goto(`/${locale}`)

      const links = [
        {
          name: "GitHub",
          href: "https://github.com/ghassanaldarwish",
        },
        {
          name: "LinkedIn",
          href: "https://linkedin.com/in/ghassan-aldarwish",
        },
      ]

      for (const { name, href } of links) {
        const socialLinks = page.getByRole("link", { name, exact: true })

        await expect(socialLinks).toHaveCount(2)

        for (const socialLink of await socialLinks.all()) {
          await expect(socialLink).toHaveAttribute("href", href)
          await expect(socialLink).toHaveAttribute("target", "_blank")
          await expect(socialLink).toHaveAttribute(
            "rel",
            /^(?:noopener noreferrer|noreferrer noopener)$/
          )
        }

        await socialLinks.first().focus()
        await expect(socialLinks.first()).toBeFocused()

        const focusStyle = await socialLinks.first().evaluate((link) => {
          const style = getComputedStyle(link)
          return `${style.outlineStyle} ${style.boxShadow}`
        })

        expect(focusStyle).not.toBe("none none")
      }
    })
  }

  for (const viewport of compactViewports) {
    test(`keeps the ${viewport.width}px layout concise and static`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto("/en")

      const hero = page.getByTestId("hero")
      const heading = page.getByTestId("hero-heading")
      const actions = page.getByTestId("hero-actions")
      const portrait = page.getByTestId("hero-portrait")
      const metrics = page.getByTestId("hero-metrics")
      const terminal = page.getByTestId("hero-terminal")

      await expect(hero).toBeVisible()
      await expect(heading).toBeVisible()
      await expect(actions).toBeVisible()
      await expect(portrait).toBeVisible()
      await expect(metrics).toBeVisible()
      await expect(terminal).toBeHidden()

      const layout = await page.evaluate((viewportHeight) => {
        const hero = document.querySelector<HTMLElement>('[data-testid="hero"]')
        const heading = document.querySelector<HTMLElement>(
          '[data-testid="hero-heading"]'
        )
        const actions = document.querySelector<HTMLElement>(
          '[data-testid="hero-actions"]'
        )
        const portrait = document.querySelector<HTMLElement>(
          '[data-testid="hero-portrait"]'
        )
        const metrics = document.querySelector<HTMLElement>(
          '[data-testid="hero-metrics"]'
        )
        const root = document.documentElement

        if (!hero || !heading || !actions || !portrait || !metrics) {
          throw new Error("Expected all responsive Hero elements to render")
        }

        const heroOverflows = [...hero.querySelectorAll("*")].some(
          (element) => {
            const box = element.getBoundingClientRect()
            return box.left < 0 || box.right > root.clientWidth
          }
        )

        return {
          actionsBottom: actions.getBoundingClientRect().bottom,
          headingBottom: heading.getBoundingClientRect().bottom,
          heroOverflows,
          metricsAnimation: getComputedStyle(metrics).animationName,
          portraitHeight: portrait.getBoundingClientRect().height,
          rootOverflows: root.scrollWidth > root.clientWidth,
          viewportHeight,
        }
      }, viewport.height)

      expect(layout.headingBottom).toBeLessThan(layout.viewportHeight)
      expect(layout.actionsBottom).toBeLessThan(layout.viewportHeight)
      expect(layout.portraitHeight).toBeLessThanOrEqual(
        viewport.portraitMaxHeight
      )
      expect(layout.heroOverflows).toBe(false)
      expect(layout.metricsAnimation).toBe("none")

      if (viewport.width === 320) {
        expect(layout.rootOverflows).toBe(false)
      }
    })
  }

  test("keeps German copy within the 360px layout", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto("/de")

    await expect(page.getByTestId("hero-heading")).toBeVisible()
    await expect(page.getByTestId("hero-actions")).toBeVisible()

    const rootOverflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    )

    expect(rootOverflows).toBe(false)
  })

  test("preserves the desktop Terminal and reduced-motion rendering", async ({
    page,
  }) => {
    const hydrationErrors: string[] = []
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        message.text().includes("Hydration failed")
      ) {
        hydrationErrors.push(message.text())
      }
    })

    await page.setViewportSize({ width: 1024, height: 768 })
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
    await page.addInitScript(() => localStorage.setItem("theme", "dark"))
    await page.goto("/en")

    await expect(page.locator("html")).toHaveClass(/dark/)

    const terminal = page.getByTestId("hero-terminal")
    await expect(terminal).toBeVisible()
    await expect(terminal).toContainText("npx ai architect")
    await expect(terminal).toContainText("git push origin main")
    expect(hydrationErrors).toEqual([])
  })

  test("keeps the Terminal LTR on the Arabic homepage", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/ar")

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")

    const terminal = page.getByTestId("hero-terminal")
    const terminalRoot = terminal.locator('[data-slot="terminal-root"]')
    const terminalContent = terminal.locator('[data-slot="terminal-content"]')
    const terminalLines = terminal.locator('[data-slot="terminal-line"]')

    await expect(terminal).toBeVisible()
    await expect(terminalRoot).toHaveCount(1)
    await expect(terminalContent).toHaveCount(1)
    await expect(terminalLines).toHaveCount(8)
    await expect(terminalRoot).toContainText("npx ai architect")

    const writingDirections = await Promise.all(
      [terminalRoot, terminalContent, terminalLines].map((locator) =>
        locator.evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element)
            return {
              direction: style.direction,
              textAlign: style.textAlign,
            }
          })
        )
      )
    )

    expect(writingDirections.flat()).toEqual(
      Array.from({ length: 10 }, () => ({
        direction: "ltr",
        textAlign: "left",
      }))
    )
  })
})
