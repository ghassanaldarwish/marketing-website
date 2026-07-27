import { expect, test, type Page } from "@playwright/test"

// Canonical rule (issue #48): a "canonical" container owns both the
// `max-w-6xl` width and the `px-4 sm:px-6` gutter on the same element, and
// sits directly inside an unpadded, full-width ancestor. That combination
// means its computed max-width is always 1152px, its computed padding-left
// is 16px below the `sm` breakpoint and 24px from `sm` upward, and it is
// horizontally centered against the page's own clientWidth.
const CANONICAL_ROUTES: { route: string; names: string[] }[] = [
  {
    route: "/en",
    names: [
      "hero-primary",
      "hero-metrics",
      "core-expertise",
      "architecture-showcase",
      "engineering-beyond-code",
      "technologies",
      "selected-projects",
      "footer",
    ],
  },
  { route: "/en/about", names: ["about-intro", "about-journey"] },
  { route: "/en/articles", names: ["articles"] },
]

const narrowViewport = { width: 390, height: 844 } as const
const desktopViewport = { width: 1440, height: 900 } as const
const CANONICAL_MAX_WIDTH_PX = 1152
const NARROW_GUTTER_PX = 16
const WIDE_GUTTER_PX = 24

type LayoutBox = {
  maxWidth: string
  paddingLeft: string
  left: number
  clientWidth: number
}

const readLayoutBox = (page: Page, name: string): Promise<LayoutBox | null> =>
  page.evaluate((containerName) => {
    const element = document.querySelector<HTMLElement>(
      `[data-layout-container="${containerName}"]`
    )
    if (!element) return null

    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()

    return {
      maxWidth: style.maxWidth,
      paddingLeft: style.paddingLeft,
      left: rect.left,
      clientWidth: document.documentElement.clientWidth,
    }
  }, name)

const expectCenteredAgainstViewport = (box: LayoutBox, maxWidthPx: number) => {
  const expectedLeft = (box.clientWidth - maxWidthPx) / 2
  expect(box.left).toBeCloseTo(expectedLeft, 0)
}

const overflowRoutes = [
  "/en",
  "/en/about",
  "/en/articles",
  "/en/contact",
  "/ar",
]

test.describe("layout gutter and width consistency", () => {
  for (const { route, names } of CANONICAL_ROUTES) {
    test(`${route} canonical containers use a ${NARROW_GUTTER_PX}px gutter at ${narrowViewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(narrowViewport)
      await page.goto(route)

      for (const name of names) {
        const box = await readLayoutBox(page, name)
        expect(box, `${name} should render`).not.toBeNull()
        expect(box?.paddingLeft, `${name} padding-left`).toBe(
          `${NARROW_GUTTER_PX}px`
        )
      }
    })

    test(`${route} canonical containers use a ${CANONICAL_MAX_WIDTH_PX}px max-width, ${WIDE_GUTTER_PX}px gutter, and a centered outer edge at ${desktopViewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(desktopViewport)
      await page.goto(route)

      for (const name of names) {
        const box = await readLayoutBox(page, name)
        expect(box, `${name} should render`).not.toBeNull()
        if (!box) continue

        expect(box.maxWidth, `${name} max-width`).toBe(
          `${CANONICAL_MAX_WIDTH_PX}px`
        )
        expect(box.paddingLeft, `${name} padding-left`).toBe(
          `${WIDE_GUTTER_PX}px`
        )
        expectCenteredAgainstViewport(box, CANONICAL_MAX_WIDTH_PX)
      }
    })
  }

  test("FinalCTA card keeps the max-w-6xl width and centered outer edge as a card-padding exception", async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport)
    await page.goto("/en")

    const box = await readLayoutBox(page, "final-cta")

    expect(box).not.toBeNull()
    if (!box) return

    // The card itself intentionally does not own a `px-4 sm:px-6` gutter —
    // its horizontal spacing comes from `p-6 sm:p-12` card padding while the
    // section wraps it in the standard gutter. Only width and centering are
    // asserted here, matching every other max-w-6xl primary container.
    expect(box.maxWidth).toBe(`${CANONICAL_MAX_WIDTH_PX}px`)
    expectCenteredAgainstViewport(box, CANONICAL_MAX_WIDTH_PX)
  })

  test("Contact keeps the standard page gutter without joining the max-w-6xl set", async ({
    page,
  }) => {
    await page.setViewportSize(narrowViewport)
    await page.goto("/en/contact")
    const narrowBox = await readLayoutBox(page, "contact")
    expect(narrowBox?.paddingLeft).toBe(`${NARROW_GUTTER_PX}px`)

    await page.setViewportSize(desktopViewport)
    await page.goto("/en/contact")
    const wideBox = await readLayoutBox(page, "contact")
    // Contact's max-w-3xl prose column is a documented width exception, so
    // only the page-level gutter is asserted — not the max-w-6xl width.
    expect(wideBox?.paddingLeft).toBe(`${WIDE_GUTTER_PX}px`)
  })

  for (const route of overflowRoutes) {
    test(`${route} has no horizontal overflow at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.goto(route)

      const overflow = await page.evaluate(() => {
        const root = document.documentElement
        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
        }
      })

      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
    })

    test(`${route} has no horizontal overflow at desktop and mobile viewports`, async ({
      page,
    }) => {
      for (const viewport of [desktopViewport, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport)
        await page.goto(route)

        const overflow = await page.evaluate(() => {
          const root = document.documentElement
          return {
            scrollWidth: root.scrollWidth,
            clientWidth: root.clientWidth,
          }
        })

        expect(
          overflow.scrollWidth,
          `${route} at ${viewport.width}px`
        ).toBeLessThanOrEqual(overflow.clientWidth + 1)
      }
    })
  }
})
