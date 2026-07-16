import { expect, test } from "@playwright/test"

const compactViewports = [
  { width: 320, height: 800, portraitMaxHeight: 320 },
  { width: 360, height: 800, portraitMaxHeight: 320 },
  { width: 390, height: 844, portraitMaxHeight: 320 },
  { width: 768, height: 1024, portraitMaxHeight: 480 },
] as const

test.describe("responsive Hero", () => {
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
    const terminalRoot = terminal.locator('[dir="ltr"]')

    await expect(terminal).toBeVisible()
    await expect(terminalRoot).toHaveCount(1)
    await expect(terminalRoot).toContainText("npx ai architect")

    const writingDirection = await terminalRoot.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        direction: style.direction,
        textAlign: style.textAlign,
      }
    })

    expect(writingDirection).toEqual({
      direction: "ltr",
      textAlign: "left",
    })
  })
})
