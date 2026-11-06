import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

test("Persian document, local font, preview metadata and no third-party requests", async ({
  page,
}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (
      !request
        .url()
        .startsWith(process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100") &&
      !request.url().startsWith("data:")
    )
      external.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some(
      (font) =>
        font.status === "loaded" &&
        font.family.toLowerCase().includes("vazirmatn"),
    );
  });
  expect(loaded).toBe(true);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [320, 360, 390, 479, 480, 768, 1024, 1440]) {
  test(`responsive layout at ${width}px with readable role panels`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const roles = page.getByRole("tablist", { name: "ماکان برای نقش شما" });
    await expect(roles.getByRole("tab")).toHaveCount(4);
    const panel = page.locator(".premium-role-panel").filter({ visible: true });
    const columns = await panel.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
    expect(columns).toBe(width < 1024 ? 1 : 2);
    await roles.getByRole("tab", { name: "والدین", exact: true }).click();
    await expect(panel.getByRole("link")).toHaveAttribute(
      "href",
      /\/solutions\/parents$/,
    );
    const headerMenu = page.getByRole("button", { name: "باز کردن منو" });
    if (width < 1024) await expect(headerMenu).toBeVisible();
    else await expect(headerMenu).toBeHidden();
    await expect(page.locator("[data-feature-preview]").first()).toBeVisible();
    if ([390, 768, 1440].includes(width)) {
      const directory = path.resolve(
        `../../docs/qa/${process.env.MAKAN_QA_PHASE ?? "step10"}`,
        testInfo.project.name,
      );
      await mkdir(directory, { recursive: true });
      await page.screenshot({
        path: path.join(directory, `home-${width}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  });
}

test("mobile drawer traps focus, closes with Escape and restores the trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "باز کردن منو" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "منوی ماکان" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: "امکانات", exact: true }).click();
  await expect(page).toHaveURL(/\/features$/);
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("skip link reaches main, and keyboard focus remains visible", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "رفتن به محتوای اصلی" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  const outline = await skip.evaluate(
    (element) => getComputedStyle(element).outlineWidth,
  );
  expect(Number.parseFloat(outline)).toBeGreaterThanOrEqual(3);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("reduced motion disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("200 percent text enlargement reflows without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  for (const route of ["/", "/demo"]) {
    await page.goto(route);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
});

for (const width of [390, 1440]) {
  test(`axe WCAG audit, homepage and drawer at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    const audit = async () => {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      await testInfo.attach("axe", {
        body: JSON.stringify(result, null, 2),
        contentType: "application/json",
      });
      expect(result.violations).toEqual([]);
    };
    await page.goto("/");
    await audit();
    if (width === 390) {
      await page.getByRole("button", { name: "باز کردن منو" }).click();
      await audit();
      await page.keyboard.press("Escape");
    }
  });
}

test("missing route returns an actual 404 with a usable recovery link", async ({
  page,
}) => {
  const response = await page.goto("/not-a-real-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "این صفحه پیدا نشد" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "بازگشت به صفحه اصلی" }).click();
  await expect(page).toHaveURL("/");
});
