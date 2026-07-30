import { expect, type Locator, test } from "@playwright/test"

async function expectMinimumTargetHeight(locator: Locator) {
  await expect
    .poll(async () => (await locator.boundingBox())?.height ?? 0)
    .toBeGreaterThanOrEqual(44)
}

test.describe("Shared Button/Input focus indicator and target size", () => {
  test("homepage contact dialog trigger, Input, and submit all reach at least 44px", async ({
    page,
  }) => {
    await page.goto("/en")

    const trigger = page.locator('button[aria-haspopup="dialog"]').last()
    await expectMinimumTargetHeight(trigger)

    await trigger.click()

    const nameInput = page.locator("#contact-name")
    await expect(nameInput).toBeVisible()
    await expectMinimumTargetHeight(nameInput)

    const submit = page
      .locator("#contact-form")
      .locator('button[type="submit"]')
    await expectMinimumTargetHeight(submit)
  })

  test("Input and submit show exactly one focus indicator, not an outline stacked on the ring", async ({
    page,
  }) => {
    await page.goto("/en/contact")

    const nameInput = page.locator("#contact-name")
    await nameInput.focus()
    await expect(nameInput).toBeFocused()

    const inputFocusStyle = await nameInput.evaluate((el) => {
      const style = getComputedStyle(el)
      return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow }
    })
    expect(inputFocusStyle.outlineStyle).toBe("none")
    expect(inputFocusStyle.boxShadow).not.toBe("none")

    const submit = page.getByRole("button", { name: /send/i })
    await submit.focus()
    await expect(submit).toBeFocused()

    const buttonFocusStyle = await submit.evaluate((el) => {
      const style = getComputedStyle(el)
      return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow }
    })
    expect(buttonFocusStyle.outlineStyle).toBe("none")
    expect(buttonFocusStyle.boxShadow).not.toBe("none")
  })

  test("empty submission marks the Input invalid with a visibly different border", async ({
    page,
  }) => {
    await page.goto("/en/contact")

    const nameInput = page.locator("#contact-name")
    const borderColorBefore = await nameInput.evaluate(
      (el) => getComputedStyle(el).borderColor
    )

    await page.getByRole("button", { name: /send/i }).click()

    await expect(nameInput).toHaveAttribute("aria-invalid", "true")
    const borderColorAfter = await nameInput.evaluate(
      (el) => getComputedStyle(el).borderColor
    )
    expect(borderColorAfter).not.toBe(borderColorBefore)
  })

  test("a generic footer link keeps the shared global outline on keyboard focus", async ({
    page,
  }) => {
    await page.goto("/en")

    const brandLink = page
      .locator("footer")
      .getByRole("link", { name: "Go to homepage" })
    await brandLink.focus()
    await expect(brandLink).toBeFocused()

    const linkFocusStyle = await brandLink.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      }
    })
    expect(linkFocusStyle.outlineStyle).toBe("solid")
    expect(linkFocusStyle.outlineWidth).toBe("2px")
  })

  test("a link styled with buttonVariants uses its ring without the global outline", async ({
    page,
  }) => {
    await page.goto("/en")

    const styledLink = page.locator("footer nav a").first()
    await styledLink.focus()
    await expect(styledLink).toBeFocused()

    const focusStyle = await styledLink.evaluate((el) => {
      const style = getComputedStyle(el)
      return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow }
    })
    expect(focusStyle.outlineStyle).toBe("none")
    expect(focusStyle.boxShadow).not.toBe("none")
  })
})
