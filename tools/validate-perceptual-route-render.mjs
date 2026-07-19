import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const bundledNodeModules = resolve(
  process.env.CODEX_PRIMARY_RUNTIME || "C:/Users/chunyang.xu/.cache/codex-runtimes/codex-primary-runtime/dependencies",
  "node/node_modules",
);
const playwright = (() => {
  try {
    return require("playwright");
  } catch (error) {
    const fallback = join(bundledNodeModules, ".pnpm/playwright@1.61.1/node_modules/playwright");
    return createRequire(join(fallback, "index.js"))(fallback);
  }
})();
const { chromium } = playwright;

const root = resolve(__dirname, "..");
const browserCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const browserExecutable = browserCandidates.find((candidate) => existsSync(candidate));
const pages = [
  "",
  "session/",
  "chapters/auditory-system-psychoacoustics/",
  "chapters/pitch-timbre-symbolic-audio/",
  "chapters/spatial-hearing-scene-analysis/",
  "chapters/audio-feature-representations/",
  "session/auditory-psychoacoustics-route/",
  "session/spatial-scene-feature-route/",
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "compact", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml; charset=utf-8",
};

function localFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const safe = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let file = resolve(join(root, safe));
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  return file;
}

function startServer() {
  const server = createServer((request, response) => {
    const file = localFile(request.url || "/");
    if (!file || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": mimeTypes[extname(file).toLowerCase()] || "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  });

  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveServer({ server, port: address.port });
    });
  });
}

async function countNonBlankPixels(canvas) {
  return canvas.evaluate((element) => {
    const context = element.getContext("2d");
    if (!context || element.width === 0 || element.height === 0) return 0;
    const data = context.getImageData(0, 0, element.width, element.height).data;
    let count = 0;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] !== 0 && (data[index - 1] !== 0 || data[index - 2] !== 0 || data[index - 3] !== 0)) {
        count += 1;
        if (count > 50) return count;
      }
    }
    return count;
  });
}

async function collectPageIssues(page) {
  return page.evaluate(() => {
    const issues = [];
    const root = document.documentElement;

    if (root.scrollWidth > root.clientWidth + 2) {
      issues.push(`page horizontal overflow: ${root.scrollWidth} > ${root.clientWidth}`);
    }

    const allowedScroll = new Set(["chapter-outline", "route-dock-links"]);
    document.querySelectorAll("body *").forEach((element) => {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") return;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const hasAllowedClass = [...allowedScroll].some((className) => element.classList.contains(className));
      const intentionallyScrollable = /(auto|scroll)/.test(style.overflowX) || hasAllowedClass;
      if (!intentionallyScrollable && element.scrollWidth > element.clientWidth + 2) {
        issues.push(`element overflow: ${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}.${[...element.classList].join(".")}`);
      }
    });

    const routeDock = document.querySelector(".route-dock");
    if (routeDock) {
      const dockRect = routeDock.getBoundingClientRect();
      const firstSection = document.querySelector("main section, main .route-hero");
      if (firstSection) {
        const sectionRect = firstSection.getBoundingClientRect();
        if (dockRect.bottom > sectionRect.bottom && dockRect.top < sectionRect.bottom) {
          issues.push("route dock may cover first section content");
        }
      }
    }

    document.querySelectorAll(".chapter-outline a, .route-dock a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#") && !document.querySelector(href)) {
        issues.push(`missing local anchor: ${href}`);
      }
    });

    return issues;
  });
}

async function exerciseControls(page) {
  const before = await page.locator(".cw-metric strong, [id$='Text']").evaluateAll((nodes) =>
    nodes.map((node) => node.textContent || "").join("|"),
  ).catch(() => "");

  const range = page.locator("input[type='range']").first();
  if (await range.count()) {
    const value = Number(await range.inputValue());
    const step = Number(await range.getAttribute("step")) || 1;
    const min = Number(await range.getAttribute("min"));
    const max = Number(await range.getAttribute("max"));
    const next = Number.isFinite(max) && value + step > max
      ? (Number.isFinite(min) ? min : value - step)
      : value + step;
    await range.fill(String(next));
    await page.waitForTimeout(80);
  }

  const checkbox = page.locator("input[type='checkbox']").first();
  if (await checkbox.count()) {
    await checkbox.click({ force: true });
    await page.waitForTimeout(80);
  }

  const after = await page.locator(".cw-metric strong, [id$='Text']").evaluateAll((nodes) =>
    nodes.map((node) => node.textContent || "").join("|"),
  ).catch(() => "");

  return before !== after || !(await page.locator("input[type='range'], input[type='checkbox']").count());
}

async function validate() {
  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch({
    executablePath: browserExecutable,
  });
  const failures = [];

  try {
    for (const viewport of viewports) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({ viewport, colorScheme: theme });
        const page = await context.newPage();
        page.on("pageerror", (error) => failures.push(`${viewport.name}/${theme}: page error: ${error.message}`));
        page.on("console", (message) => {
          if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
            failures.push(`${viewport.name}/${theme}: console error: ${message.text()}`);
          }
        });
        page.on("response", (response) => {
          const url = response.url();
          if (url.startsWith(base) && response.status() >= 400 && !url.endsWith("/favicon.ico")) {
            failures.push(`${viewport.name}/${theme}: ${response.status()} ${url}`);
          }
        });

        for (const path of pages) {
          const label = `${path} @ ${viewport.name}/${theme}`;
          await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
          await page.evaluate((mode) => document.documentElement.setAttribute("data-theme", mode), theme);
          await page.waitForTimeout(120);

          const issues = await collectPageIssues(page);
          issues.forEach((issue) => failures.push(`${label}: ${issue}`));

          const needsPersistentNav = path.startsWith("chapters/") || (path.startsWith("session/") && path !== "session/");
          const navCount = await page.locator(".chapter-outline, .route-dock").count();
          if (needsPersistentNav && !navCount) failures.push(`${label}: missing persistent route navigation`);

          const visuals = page.locator(".cw-visual");
          const visualCount = await visuals.count();
          for (let index = 0; index < visualCount; index += 1) {
            const visual = visuals.nth(index);
            const svgCount = await visual.locator("svg").count();
            const box = await visual.boundingBox();
            if (!svgCount) failures.push(`${label}: .cw-visual ${index + 1} has no SVG`);
            if (!box || box.width <= 10 || box.height <= 10) failures.push(`${label}: .cw-visual ${index + 1} has invalid size`);
          }

          const canvases = page.locator("canvas");
          const canvasCount = await canvases.count();
          for (let index = 0; index < canvasCount; index += 1) {
            const canvas = canvases.nth(index);
            const box = await canvas.boundingBox();
            const nonBlank = await countNonBlankPixels(canvas);
            if (!box || box.width <= 10 || box.height <= 10) failures.push(`${label}: canvas ${index + 1} has invalid size`);
            if (nonBlank <= 50) failures.push(`${label}: canvas ${index + 1} appears blank`);
          }

          const frames = page.locator("iframe");
          const frameCount = await frames.count();
          for (let index = 0; index < frameCount; index += 1) {
            const frame = frames.nth(index);
            const box = await frame.boundingBox();
            if (!box || box.width <= 120 || box.height <= 180) {
              failures.push(`${label}: iframe ${index + 1} has invalid size`);
            }
          }

          const controlsWorked = await exerciseControls(page);
          if (!controlsWorked) failures.push(`${label}: controls did not update displayed metrics`);

          const anchors = await page.locator(".chapter-outline a[href^='#']").evaluateAll((links) =>
            links.map((link) => link.getAttribute("href")),
          );
          for (const anchor of anchors) {
            await page.click(`.chapter-outline a[href='${anchor}']`);
            await page.waitForTimeout(50);
            const hidden = await page.evaluate((selector) => {
              const target = document.querySelector(selector);
              const outline = document.querySelector(".chapter-outline");
              if (!target || !outline) return false;
              return target.getBoundingClientRect().top < outline.getBoundingClientRect().bottom - 2;
            }, anchor);
            if (hidden) failures.push(`${label}: anchor ${anchor} is hidden under outline`);
          }
        }

        await context.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  }

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  console.log(`Validated ${pages.length} pages at ${viewports.length} viewports in light/dark themes.`);
}

validate().catch((error) => {
  console.error(error);
  process.exit(1);
});
