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
        const foregroundPaths = paths.filter((path) =>
          path.classList.contains("fill-foreground")
        )
        const backgroundPaths = paths.filter((path) =>
          path.classList.contains("fill-background")
        )
        const mutedPaths = paths.filter((path) =>
          path.classList.contains("fill-muted-foreground")
        )
        const box = element.getBoundingClientRect()
        const pageBackground = getComputedStyle(document.body).backgroundColor
        const fills = (items: SVGPathElement[]) =>
          items.map((path) => getComputedStyle(path).fill)

        return {
          width: box.width,
          height: box.height,
          pageBackground,
          foregroundFills: fills(foregroundPaths),
          backgroundFills: fills(backgroundPaths),
          mutedFills: fills(mutedPaths),
          filters: paths.map((path) => getComputedStyle(path).filter),
          pageOverflows:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        }
      })

      expect(rendering.width).toBe(viewport.iconSize)
      expect(rendering.height).toBe(viewport.iconSize)
      expect(rendering.foregroundFills).toHaveLength(14)
      expect(rendering.backgroundFills).toHaveLength(2)
      expect(rendering.mutedFills).toHaveLength(1)
      expect(rendering.foregroundFills).not.toContain(rendering.pageBackground)
      expect(rendering.mutedFills).not.toContain(rendering.pageBackground)
      expect(rendering.backgroundFills[0]).not.toBe(
        rendering.foregroundFills[0]
      )
      expect(new Set(rendering.filters)).toEqual(new Set(["none"]))
      expect(rendering.pageOverflows).toBe(false)
    })
  }
}
