import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source)
  throw new Error(
    "Usage: node scripts/extract-product-screens.mjs <source.pdf>",
  );
const temporary = path.resolve(".preview/pdf-reference");
const output = path.resolve("apps/web/public/images/product");
await Promise.all([
  mkdir(temporary, { recursive: true }),
  mkdir(output, { recursive: true }),
]);

// Crop the phone frames only. Coordinates refer to the 1800px page render.
const frames = { right: 1370, middle: 980, left: 590 };
const screens = [
  { name: "school-today", page: 6, frame: "right", design: "MK-04" },
  { name: "school-lesson", page: 6, frame: "middle", design: "MK-05" },
  { name: "activities-classes", page: 8, frame: "middle", design: "MK-11" },
  { name: "activities-requests", page: 8, frame: "left", design: "MK-12" },
  { name: "assistant-start", page: 18, frame: "right", design: "MK-38" },
  { name: "assistant-answer", page: 18, frame: "left", design: "MK-40" },
  { name: "messages-inbox", page: 17, frame: "right", design: "MK-35" },
  { name: "messages-chat", page: 17, frame: "middle", design: "MK-36" },
  { name: "profile-account", page: 30, frame: "right", design: "MK-47" },
  { name: "profile-security", page: 30, frame: "middle", design: "MK-48" },
];
for (const page of new Set(screens.map((screen) => screen.page))) {
  const prefix = path.join(temporary, `page-${page}-hi`);
  execFileSync("pdftoppm", [
    "-f",
    String(page),
    "-l",
    String(page),
    "-scale-to",
    "3600",
    "-singlefile",
    "-png",
    source,
    prefix,
  ]);
  for (const screen of screens.filter((item) => item.page === page)) {
    const result = await sharp(`${prefix}.png`)
      .extract({
        left: frames[screen.frame] * 2,
        top: 228 * 2,
        width: 360 * 2,
        height: 770 * 2,
      })
      .resize({ width: 600 })
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(output, `${screen.name}.webp`));
    Object.assign(screen, {
      width: result.width,
      height: result.height,
      bytes: result.size,
    });
  }
}
const sha256 = createHash("sha256")
  .update(await readFile(source))
  .digest("hex");
await writeFile(
  path.join(output, "source.json"),
  JSON.stringify({ source: path.basename(source), sha256, screens }, null, 2) +
    "\n",
);
console.log(
  JSON.stringify({
    screens: screens.length,
    bytes: screens.reduce((sum, item) => sum + item.bytes, 0),
  }),
);
