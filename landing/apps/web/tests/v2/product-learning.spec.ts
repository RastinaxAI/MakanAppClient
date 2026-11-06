import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { login } from "./helpers";

async function mutate(
  page: Page,
  route: string,
  data: unknown,
  version?: number,
) {
  const csrf = (
    await (await page.request.get("/api/v1/admin/auth/csrf")).json()
  ).csrf_token;
  const response = await page.request.post(`/api/v1/admin/${route}`, {
    headers: {
      Origin: "http://127.0.0.1:3200",
      "X-CSRF-Token": csrf,
      ...(version ? { "If-Match": String(version) } : {}),
    },
    data,
  });
  expect(response.status(), await response.text()).toBe(version ? 200 : 201);
  return response.json();
}

test("published product guides filter by role, expose reading position and enlarge real stored media", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);
  const csrf = (
    await (await page.request.get("/api/v1/admin/auth/csrf")).json()
  ).csrf_token;
  const upload = await page.request.post("/api/v1/admin/media", {
    headers: { Origin: "http://127.0.0.1:3200", "X-CSRF-Token": csrf },
    multipart: {
      alt_text: "تصویر آموزشی آزمون",
      file: {
        name: "guide.png",
        mimeType: "image/png",
        buffer: await readFile(path.resolve("tests/fixtures/cms.png")),
      },
    },
  });
  expect(upload.status()).toBe(201);
  const media = (await upload.json()).id as string;
  const slug = `guide-${info.project.name}-${randomUUID().slice(0, 8)}`;
  const paragraph =
    "این متن فقط در پایگاه دادهٔ مستقل آزمون قرار دارد و برای بررسی خواندن مرحله‌های یک راهنما استفاده می‌شود. ".repeat(
      12,
    );
  const article = await mutate(page, "learn/contents", {
    slug,
    title: `راهنمای تصویری ${slug}`,
    payload: {
      kind: "article",
      headline: `راهنمای تصویری ${slug}`,
      summary: "راهنمای آزمایشی با تصویر و عنوان‌های مرحله‌ای",
      audiences: ["teacher"],
      level: "beginner",
      topic: "getting-started",
      body_html: `<h2>ورود به فضای کاری</h2><p>${paragraph}</p><img src="/api/v1/media/${media}/file" alt="تصویر آموزشی آزمون"><h2>پیدا کردن بخش موردنظر</h2><p>${paragraph}</p><h2>ادامهٔ مسیر</h2><p>${paragraph}</p>`,
      category_ids: [],
      tag_ids: [],
    },
  });
  await mutate(
    page,
    `learn/contents/${article.id}/publish`,
    { revision_id: article.revision_id },
    article.row_version,
  );
  const draft = await mutate(page, "learn/contents", {
    slug: `${slug}-private`,
    title: `پیش‌نویس ${slug}`,
    payload: {
      kind: "article",
      headline: `پیش‌نویس ${slug}`,
      summary: "این پیش‌نویس نباید عمومی شود.",
      body_html: "<p>محتوای خصوصی آزمون</p>",
      audiences: ["teacher"],
      level: "beginner",
      topic: "getting-started",
      category_ids: [],
      tag_ids: [],
    },
  });
  expect(draft.publication_state).toBe("draft");
  await page.goto("/learn");
  await page.getByRole("link", { name: /معلم هستم/ }).click();
  await expect(page).toHaveURL(/audience=teacher/);
  expect(new URL(page.url()).searchParams.get("audience")).toBe("teacher");
  expect(new URL(page.url()).searchParams.get("topic")).toBe("getting-started");
  await expect(page.locator(".learning-current-path")).toContainText("معلم");
  await expect(
    page.getByRole("link", { name: `راهنمای تصویری ${slug}`, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: `پیش‌نویس ${slug}`, exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: `راهنمای تصویری ${slug}`, exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "فهرست مطالب", exact: true }),
  ).toContainText("پیدا کردن بخش موردنظر");
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۱ از ۳",
  );
  await page
    .getByRole("button", { name: "بخش بعدی راهنما", exact: true })
    .click();
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۲ از ۳",
  );
  await expect(page).toHaveURL(/#.+/);
  // Ordinary scrolling also updates the location, without using the guide buttons.
  await page
    .getByRole("heading", { name: "ادامهٔ مسیر", exact: true })
    .evaluate((heading) =>
      heading.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۳ از ۳",
  );
  await page
    .getByRole("button", { name: "بخش قبلی راهنما", exact: true })
    .click();
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۲ از ۳",
  );
  await page
    .getByRole("button", { name: "بخش قبلی راهنما", exact: true })
    .click();
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۱ از ۳",
  );
  await page.getByText("بخش‌های این راهنما", { exact: true }).click();
  await page
    .getByRole("navigation", { name: "فهرست مطالب", exact: true })
    .getByRole("link", { name: "۳ · ادامهٔ مسیر", exact: true })
    .click();
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۳ از ۳",
  );
  await expect(
    page.locator(".guide-reading-tools details"),
  ).not.toHaveAttribute("open");
  await expect(
    page.getByRole("heading", { name: "ادامهٔ مسیر", exact: true }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "بخش قبلی راهنما", exact: true })
    .click();
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۲ از ۳",
  );
  await page
    .getByRole("button", { name: "بخش قبلی راهنما", exact: true })
    .click();
  await expect(page.locator(".guide-reading-position")).toContainText(
    "بخش ۱ از ۳",
  );
  const openImage = page.getByRole("button", {
    name: "باز کردن تصویر ۱: تصویر آموزشی آزمون",
    exact: true,
  });
  await openImage.click();
  const zoom = page.getByRole("dialog", {
    name: "تصویر آموزشی آزمون",
    exact: true,
  });
  await expect(zoom.locator("img")).toHaveAttribute(
    "src",
    `/api/v1/media/${media}/file`,
  );
  await page.keyboard.press("Escape");
  await expect(openImage).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const directory = path.resolve(
    `../../docs/qa/product-learning/${info.project.name}`,
  );
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, "product-guide-reader-390.png"),
    fullPage: false,
  });
});
