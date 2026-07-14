import { expect, test } from "@playwright/test"

const arabicRoutes = ["/ar", "/ar/about", "/ar/contact", "/ar/articles"]

test.describe("Arabic typography", () => {
  for (const route of arabicRoutes) {
    test(`${route} uses the Arabic font without horizontal overflow`, async ({
      page,
    }) => {
      const response = await page.goto(route)

      expect(response?.status()).toBeLessThan(400)
      await expect(page.locator("html")).toHaveAttribute("lang", "ar")
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
      await expect(page.locator("html")).toHaveAttribute("data-locale", "ar")

      const typography = await page.evaluate(() => {
        const bodyStyle = window.getComputedStyle(document.body)
        const root = document.documentElement

        return {
          bodyFontFamily: bodyStyle.fontFamily,
          bodyLineHeight: Number.parseFloat(bodyStyle.lineHeight),
          bodyFontSize: Number.parseFloat(bodyStyle.fontSize),
          overflows: root.scrollWidth > root.clientWidth,
        }
      })

      expect(typography.bodyFontFamily).toContain("Noto Sans Arabic")
      expect(typography.bodyLineHeight).toBeGreaterThan(
        typography.bodyFontSize * 1.5
      )
      expect(typography.overflows).toBe(false)
    })
  }

  test("Arabic headings remove uppercase and excessive tracking", async ({
    page,
  }) => {
    await page.goto("/ar")

    const result = await page.evaluate(() => {
      const heading = document.createElement("h2")
      heading.className = "uppercase tracking-widest"
      heading.textContent = "هندسة البرمجيات"
      document.body.append(heading)

      const style = window.getComputedStyle(heading)
      const computed = {
        fontFamily: style.fontFamily,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
      }

      heading.remove()
      return computed
    })

    expect(result.fontFamily).toContain("Noto Sans Arabic")
    expect(result.letterSpacing).toBe("normal")
    expect(result.textTransform).toBe("none")
  })

  test("technical fragments and code stay isolated LTR", async ({ page }) => {
    await page.goto("/ar")

    const result = await page.evaluate(() => {
      const container = document.createElement("p")
      container.lang = "ar"
      container.innerHTML =
        'استخدم <code>Node.js 24.1</code> مع <a href="https://example.com/docs?v=2">https://example.com/docs?v=2</a>'
      document.body.append(container)

      const code = container.querySelector("code")
      const link = container.querySelector("a")

      if (!code || !link) {
        throw new Error("Expected technical fragments were not created")
      }

      const codeStyle = window.getComputedStyle(code)
      const linkStyle = window.getComputedStyle(link)
      const computed = {
        codeDirection: codeStyle.direction,
        codeBidi: codeStyle.unicodeBidi,
        codeFontFamily: codeStyle.fontFamily,
        linkDirection: linkStyle.direction,
        linkBidi: linkStyle.unicodeBidi,
      }

      container.remove()
      return computed
    })

    expect(result.codeDirection).toBe("ltr")
    expect(result.codeBidi).toBe("isolate")
    expect(result.codeFontFamily).toContain("Geist Mono")
    expect(result.linkDirection).toBe("ltr")
    expect(result.linkBidi).toBe("isolate")
  })
})

test.describe("Latin typography regression", () => {
  for (const locale of ["en", "de"] as const) {
    test(`${locale} keeps the Latin font and LTR direction`, async ({ page }) => {
      await page.goto(`/${locale}`)

      await expect(page.locator("html")).toHaveAttribute("dir", "ltr")

      const bodyFontFamily = await page.evaluate(
        () => window.getComputedStyle(document.body).fontFamily
      )

      expect(bodyFontFamily).toContain("Inter")
      expect(bodyFontFamily).not.toContain("Noto Sans Arabic")
    })
  }
})
