import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stillFrame = process.env.STILL ? Number(process.env.STILL) : null;
const out = process.env.OUT ?? "/mnt/documents/bronx-demo.mp4";

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });
console.log("duration frames", composition.durationInFrames);

if (stillFrame !== null) {
  await renderStill({
    composition,
    serveUrl: bundled,
    output: `/tmp/still-${stillFrame}.png`,
    frame: stillFrame,
    puppeteerInstance: browser,
  });
} else {
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    crf: 22,
    outputLocation: out,
    puppeteerInstance: browser,
    muted: true,
    concurrency: 4,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) console.log("progress", Math.round(progress * 100));
    },
  });
}

await browser.close({ silent: false });
