import { expect, test } from "@playwright/test"

for (const locale of ["en", "de", "ar"] as const) {
  test(`${locale} article heading uses primary typography without overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 })

    const response = await page.goto(`/${locale}/articles/ai-agent-platform`)

    expect(response?.status()).toBeLessThan(400)

    const heading = page.locator("main article header h1")

    await expect(heading).toBeVisible()
    await expect(heading).toHaveClass(/font-semibold/)
    await expect(heading).toHaveClass(/tracking-tight/)
    await expect(heading).toHaveClass(/text-balance/)

    const layout = await heading.evaluate((element) => {
      const root = document.documentElement
      const box = element.getBoundingClientRect()

      return {
        headingInsideViewport: box.left >= 0 && box.right <= root.clientWidth,
        pageOverflows: root.scrollWidth > root.clientWidth,
      }
    })

    expect(layout).toEqual({
      headingInsideViewport: true,
      pageOverflows: false,
    })
  })
}

test("article prose stays readable while wide content remains contained", async ({
  page,
  isMobile,
}) => {
  const response = await page.goto("/en/articles/ai-agent-platform")

  expect(response?.status()).toBeLessThan(400)

  const layout = await page.evaluate(() => {
    const root = document.documentElement
    const article = document.querySelector("main article")
    const paragraph = document.querySelector("[data-article-prose] > p")
    const heading = document.querySelector("[data-article-prose] > h2")
    const tableWrapper = document.querySelector<HTMLElement>(
      "[data-article-table]"
    )

    if (!article || !paragraph || !heading || !tableWrapper) {
      throw new Error("Expected article reading-layout elements")
    }

    const headingStyle = window.getComputedStyle(heading)

    return {
      pageOverflows: root.scrollWidth > root.clientWidth,
      articleWidth: article.getBoundingClientRect().width,
      paragraphWidth: paragraph.getBoundingClientRect().width,
      headingMarginTop: Number.parseFloat(headingStyle.marginTop),
      headingPaddingTop: Number.parseFloat(headingStyle.paddingTop),
      tableWrapperWidth: tableWrapper.getBoundingClientRect().width,
      tableScrollWidth: tableWrapper.scrollWidth,
    }
  })

  expect(layout.pageOverflows).toBe(false)
  expect(layout.headingMarginTop).toBeLessThanOrEqual(56)
  expect(layout.headingPaddingTop).toBe(0)

  if (isMobile) {
    expect(layout.paragraphWidth).toBeLessThanOrEqual(layout.articleWidth)
    expect(layout.tableScrollWidth).toBeGreaterThan(layout.tableWrapperWidth)
  } else {
    expect(layout.paragraphWidth).toBeLessThan(layout.articleWidth)
    expect(layout.tableWrapperWidth).toBeGreaterThan(layout.paragraphWidth)
  }
})

test("article metadata and heading anchors use the active locale", async ({
  page,
}) => {
  await page.goto("/de/articles/ai-agent-platform")

  await expect(page.getByText(/Min\. Lesezeit/)).toBeVisible()
  await expect(
    page.locator('h2#das-problem a[aria-label="Link zu diesem Abschnitt"]')
  ).toBeVisible()
})

test("long articles provide a table of contents without page overflow", async ({
  page,
}) => {
  const response = await page.goto("/de/articles/ai-agent-platform")

  expect(response?.status()).toBeLessThan(400)

  const tableOfContents = page.getByRole("navigation", {
    name: "Inhaltsverzeichnis",
  })

  await expect(tableOfContents).toBeVisible()
  await expect(tableOfContents.locator('a[href="#das-problem"]')).toBeVisible()

  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    const tableWrapper = document.querySelector<HTMLElement>(
      "[data-article-table]"
    )
    const codeBlock = document.querySelector<HTMLElement>(
      "[data-rehype-pretty-code-figure] pre"
    )

    return {
      pageOverflows: root.scrollWidth > root.clientWidth,
      tableIsScrollable: tableWrapper
        ? tableWrapper.scrollWidth >= tableWrapper.clientWidth
        : false,
      codeIsContained: codeBlock
        ? codeBlock.getBoundingClientRect().right <= root.clientWidth
        : false,
    }
  })

  expect(overflow).toEqual({
    pageOverflows: false,
    tableIsScrollable: true,
    codeIsContained: true,
  })
})
