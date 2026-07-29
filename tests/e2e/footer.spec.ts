import { expect, test } from "@playwright/test"

test.describe("Footer contact link", () => {
  test("renders the email as the first metadata row with a decorative icon", async ({
    page,
  }) => {
    await page.goto("/en")

    const metadataRows = page.locator("footer p")
    const contactRow = metadataRows.first()
    const emailLink = contactRow.getByRole("link", {
      name: "info@ghassan.de",
    })

    await expect(emailLink).toHaveAttribute("href", "mailto:info@ghassan.de")
    await expect(emailLink.locator('svg[aria-hidden="true"]')).toHaveCount(1)
    await expect(contactRow).toContainText("info@ghassan.de")
    await expect(metadataRows.nth(1)).toContainText("©")
  })

  test("keeps responsive alignment and shows a clear focus indicator", async ({
    page,
  }, testInfo) => {
    await page.goto("/en")

    const emailLink = page
      .locator("footer")
      .getByRole("link", { name: "info@ghassan.de" })
    await emailLink.focus()
    await expect(emailLink).toBeFocused()

    const styles = await emailLink.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        boxShadow: style.boxShadow,
        justifyContent: style.justifyContent,
        outlineStyle: style.outlineStyle,
      }
    })

    expect(styles.outlineStyle).toBe("none")
    expect(styles.boxShadow).not.toBe("none")
    expect(styles.justifyContent).toBe(
      testInfo.project.name === "mobile-chromium" ? "center" : "flex-start"
    )
  })
})
