import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { gunzipSync, gzipSync } from "node:zlib";

const { values } = parseArgs({
  options: {
    origin: { type: "string", default: "http://127.0.0.1:3200" },
    output: { type: "string", default: ".preview/public-performance.json" },
    label: { type: "string", default: "local" },
    runs: { type: "string", default: "5" },
  },
});
assert.match(values.origin, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const runs = Number(values.runs);
assert.ok(Number.isInteger(runs) && runs >= 1 && runs <= 20);
const origin = new URL(values.origin);

async function read(url) {
  assert.equal(url.origin, origin.origin);
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const request = http.get(
      url,
      { headers: { "Accept-Encoding": "gzip" } },
      (response) => {
        const ttfb = performance.now() - started;
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("error", reject);
        response.on("end", () => {
          const raw = Buffer.concat(chunks);
          const body =
            response.headers["content-encoding"] === "gzip"
              ? gunzipSync(raw)
              : raw;
          resolve({
            status: response.statusCode,
            ttfb_ms: Math.round(ttfb * 10) / 10,
            total_ms: Math.round((performance.now() - started) * 10) / 10,
            wire_bytes: raw.length,
            body,
          });
        });
      },
    );
    request.setTimeout(30000, () =>
      request.destroy(new Error("Local page timed out")),
    );
    request.on("error", reject);
  });
}

const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const rows = [];
for (const route of ["/", "/features", "/makan-nasiri"]) {
  const timings = [];
  let latest;
  for (let run = 0; run < runs; run++) {
    latest = await read(new URL(route, origin));
    assert.equal(latest.status, 200, route);
    timings.push({ ttfb_ms: latest.ttfb_ms, total_ms: latest.total_ms });
  }
  const html = latest.body.toString();
  const assets = new Map();
  for (const [kind, pattern] of [
    ["css", /<link\b[^>]*\bhref="([^" ]+\.css[^" ]*)"/g],
    ["js", /<script\b[^>]*\bsrc="([^" ]+)"/g],
  ]) {
    for (const match of html.matchAll(pattern)) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), origin);
      if (
        url.origin === origin.origin &&
        url.pathname.startsWith("/_next/static/")
      )
        assets.set(url.href, kind);
    }
  }
  const resources = await Promise.all(
    [...assets].map(async ([href, kind]) => {
      const resource = await read(new URL(href));
      assert.equal(resource.status, 200, href);
      return {
        kind,
        path: new URL(href).pathname,
        decoded_bytes: resource.body.length,
        gzip_estimate_bytes: gzipSync(resource.body).length,
      };
    }),
  );
  rows.push({
    route,
    samples: timings,
    median_ttfb_ms: median(timings.map((item) => item.ttfb_ms)),
    median_total_ms: median(timings.map((item) => item.total_ms)),
    html_wire_bytes: latest.wire_bytes,
    css_bytes: resources
      .filter((item) => item.kind === "css")
      .reduce((sum, item) => sum + item.decoded_bytes, 0),
    js_bytes: resources
      .filter((item) => item.kind === "js")
      .reduce((sum, item) => sum + item.decoded_bytes, 0),
    resources,
  });
}
const report = {
  label: values.label,
  origin: origin.href,
  measured_at: new Date().toISOString(),
  environment:
    "Local loopback HTTP. These are server response and asset measurements, not browser Web Vitals or field data.",
  rows,
};
const output = path.resolve(values.output);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify(
    {
      label: report.label,
      rows: rows.map(({ resources, samples, ...row }) => row),
      output,
    },
    null,
    2,
  ),
);
