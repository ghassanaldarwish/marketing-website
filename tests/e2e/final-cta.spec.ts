import { expect, test } from "@playwright/test"

test.describe("Final CTA semantics and styling", () => {
  test("is a labelled section without an assertive live region", async ({
    page,
  }) => {
    await page.goto("/en")

    const cta = page.getByTestId("final-cta")
    await expect(cta).toHaveRole("region")
    await expect(cta.getByRole("alert")).toHaveCount(0)
    await expect(cta.locator('[aria-live="assertive"]')).toHaveCount(0)

    const headingId = await page
      .getByTestId("final-cta-heading")
      .getAttribute("id")
    expect(headingId).toBeTruthy()
    await expect(cta).toHaveAttribute("aria-labelledby", headingId ?? "")
  })

  for (const colorScheme of ["light", "dark"] as const) {
    test(`background is visibly distinguishable from the page in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
      await page.addInitScript(
        (scheme) => localStorage.setItem("theme", scheme),
        colorScheme
      )
      await page.goto("/en")

      await expect(page.locator("html")).toHaveClass(
        colorScheme === "dark" ? /dark/ : /light/
      )

      const cta = page.getByTestId("final-cta")
      const wrapper = cta.locator(":scope > div").first()

      const wrapperStyles = await wrapper.evaluate((el) => {
        const style = getComputedStyle(el)

        return {
          background: style.backgroundColor,
          borderTopColor: style.borderTopColor,
          borderTopWidth: style.borderTopWidth,
        }
      })
      const pageBackground = await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor)

      expect(wrapperStyles.background).not.toBe(pageBackground)
      expect(wrapperStyles.background).not.toBe("rgba(0, 0, 0, 0)")
      expect(wrapperStyles.borderTopColor).not.toBe("rgba(0, 0, 0, 0)")
      expect(wrapperStyles.borderTopWidth).not.toBe("0px")
    })
  }
})
