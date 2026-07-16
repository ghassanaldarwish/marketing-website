import { expect, test } from "@playwright/test"

const viewports = [
  { width: 320, height: 800, iconSize: 40 },
  { width: 390, height: 844, iconSize: 40 },
  { width: 1440, height: 900, iconSize: 56 },
] as const

for (const colorScheme of ["light", "dark"] as const) {
  for (const viewport of viewports) {
    test(`Jenkins remains visible at ${viewport.width}px in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.setViewportSize(viewport)
      await page.goto("/en")

      const icon = page.getByTestId("jenkins-icon")

      await expect(icon).toBeVisible()
      await expect(icon).toHaveAttribute("aria-label", "Jenkins")

      const rendering = await icon.evaluate((element) => {
        const paths = [...element.querySelectorAll("path")]
        const glyph = element.querySelector<SVGPathElement>(
          '[data-part="glyph"]'
        )

        if (!glyph) {
          throw new Error("Expected the Jenkins glyph to render")
        }

        const box = element.getBoundingClientRect()
        const pageBackground = getComputedStyle(document.body).backgroundColor
        const pathData = glyph.getAttribute("d") ?? ""

        return {
          width: box.width,
          height: box.height,
          pageBackground,
          pathCount: paths.length,
          glyphFill: getComputedStyle(glyph).fill,
          subpathCount: (pathData.match(/[Mm]/g) ?? []).length,
          filters: paths.map((path) => getComputedStyle(path).filter),
          pageOverflows:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        }
      })

      expect(rendering.width).toBe(viewport.iconSize)
      expect(rendering.height).toBe(viewport.iconSize)
      expect(rendering.pathCount).toBe(1)
      expect(rendering.subpathCount).toBeGreaterThan(10)
      expect(rendering.glyphFill).not.toBe(rendering.pageBackground)
      expect(new Set(rendering.filters)).toEqual(new Set(["none"]))
      expect(rendering.pageOverflows).toBe(false)
    })
  }
}
