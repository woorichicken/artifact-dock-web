/**
 * 실제 제품을 조작하는 데모 녹화.
 *
 *   node scripts/demo-scenario.mjs <출력폴더> [artifact-dock 저장소]
 *
 * - 사용자 Chrome·실제 dock.sock 을 건드리지 않는다: 프로필과 소켓을 격리하고 헤드리스로 돈다.
 *   화면도 포커스도 안 뺏는다(이 제품 데모가 사용자 화면을 뺏으면 말이 안 된다).
 * - 확장·호스트·CLI 는 그 저장소의 커밋된 코드 그대로다. 무대 페이지(scripts/demo)만 사본에 얹는다.
 * - 영어로 찍으려고 사본에서 ko·es 번역만 뺀다(macOS 는 --lang 을 안 따른다). 기능 코드는 그대로다.
 */
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.argv[2] ?? "./demo-out");
const SRC = path.resolve(process.argv[3] ?? path.join(os.homedir(), "Downloads/artifact-dock"));
// 영상에 경로가 찍히므로 짧고 개인 정보 없는 자리에 둔다. 소켓 경로 104자 제한도 있다.
const WORK = "/tmp/artifact-dock-demo";
const EXT = path.join(WORK, "ext");
const PROFILE = path.join(WORK, `profile-${Date.now()}`);
const SOCK = path.join(WORK, "dock.sock");
const REPORTS = path.join(WORK, "reports");
const W = 1280, H = 800;

function prepare() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(EXT, { recursive: true, force: true });
  fs.rmSync(REPORTS, { recursive: true, force: true });
  fs.rmSync(SOCK, { force: true });
  fs.mkdirSync(EXT, { recursive: true });
  fs.mkdirSync(REPORTS, { recursive: true });

  const tar = execFileSync("git", ["-C", SRC, "archive", "HEAD", "manifest.json", "src", "_locales", "icons", "host", "bin"], { maxBuffer: 1e9 });
  execFileSync("tar", ["-x", "-C", EXT], { input: tar });
  for (const lang of ["ko", "es"]) fs.rmSync(path.join(EXT, "_locales", lang), { recursive: true, force: true });
  fs.cpSync(path.join(HERE, "demo"), path.join(EXT, "demo"), { recursive: true });
  fs.chmodSync(path.join(EXT, "host/artifact_dock_host.py"), 0o755);

  // Chromium 은 --user-data-dir 아래 NativeMessagingHosts 도 읽는다 → 시스템 등록 없이 호스트가 붙는다.
  const hostSh = path.join(WORK, "host.sh");
  fs.writeFileSync(hostSh, `#!/bin/bash\nexport ARTIFACT_DOCK_SOCKET=${SOCK}\nexec python3 ${EXT}/host/artifact_dock_host.py\n`, { mode: 0o755 });
  const nm = path.join(PROFILE, "NativeMessagingHosts");
  fs.mkdirSync(nm, { recursive: true });
  fs.writeFileSync(path.join(nm, "dev.artifactdock.host.json"), JSON.stringify({
    name: "dev.artifactdock.host", description: "demo", path: hostSh, type: "stdio",
    allowed_origins: ["chrome-extension://hanplflofffhnolmbildckncaclkjbmf/"],
  }));

  const report = (title, heading, rows) => `<!doctype html><meta charset="utf-8"><title>${title}</title>
<style>body{font:17px/1.5 -apple-system,Arial,sans-serif;margin:0;color:#222}header{background:#26324a;color:#fff;padding:26px 30px}h1{margin:0;font-size:30px}main{padding:18px 30px}li{margin:8px 0}</style>
<header><h1>${heading}</h1></header><main><ul>${rows.map((r) => `<li>${r}</li>`).join("")}</ul></main>`;
  fs.writeFileSync(path.join(REPORTS, "test-report.html"), report("Test report: 12 passed", "12 passed", ["Sample document for this demo", "auth · 5 passed", "billing · 4 passed", "search · 3 passed"]));
  fs.writeFileSync(path.join(REPORTS, "api-review.html"), report("API review", "API review", ["Sample document for this demo", "3 endpoints checked"]));
  fs.writeFileSync(path.join(REPORTS, "design-notes.html"), report("Design notes", "Design notes", ["Sample document for this demo", "Two layouts compared"]));
}

prepare();

const events = [];
let t0 = 0;
const now = () => (Date.now() - t0) / 1000;
const ev = (o) => events.push(o);

const context = await chromium.launchPersistentContext(PROFILE, {
  headless: false, // Playwright 기본 헤드리스 셸은 확장을 못 올린다. 아래 --headless=new 로 창 없이 돈다.
  viewport: { width: W, height: H },
  recordVideo: { dir: OUT, size: { width: W, height: H } },
  args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, "--headless=new", "--no-first-run"],
});

const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
const extId = new URL(sw.url()).host;
for (let i = 0; i < 40 && !fs.existsSync(SOCK); i++) await new Promise((r) => setTimeout(r, 250));
if (!fs.existsSync(SOCK)) throw new Error("호스트 소켓이 안 생겼다");

// 첫 설치 안내 탭과 빈 탭을 닫고 무대 탭만 남긴다.
// 새 페이지를 만들면 창이 하나 더 생겨 문서가 다른 창으로 간다(실측) — 이미 있는 탭을 무대로 쓴다.
const page = context.pages().find((p) => !p.url().includes("welcome")) ?? (await context.newPage());
for (let i = 0; i < 20 && !context.pages().some((p) => p.url().includes("welcome")); i++) await page.waitForTimeout(100);
for (const p of context.pages()) if (p !== page) await p.close();
await page.bringToFront();

await page.exposeFunction("runShell", (line) => new Promise((resolve) => {
  const child = spawn("/bin/bash", ["-c", line], {
    cwd: REPORTS,
    env: { ...process.env, PATH: `${path.join(EXT, "bin")}:/usr/bin:/bin`, ARTIFACT_DOCK_SOCKET: SOCK },
  });
  let stdout = "", stderr = "";
  child.stdout.on("data", (d) => (stdout += d));
  child.stderr.on("data", (d) => (stderr += d));
  child.on("close", (code) => {
    ev({ type: "note", t: now(), cmd: line, code });
    resolve({ stdout, stderr });
  });
}));

t0 = Date.now();
ev({ type: "header", display: { w: W, h: H } });
await page.goto(`chrome-extension://${extId}/demo/stage.html`);
await page.waitForFunction(() => window.stageReady === true);
await page.waitForTimeout(800);
// 여기까지는 빈 화면과 로딩이다. 영상 첫 프레임이 곧 재생 전 화면이 되므로 이 앞은 잘라 낸다.
const startAt = now();

const panel = page.frameLocator("#panel");
let cur = { x: 420, y: 330 };
await page.mouse.move(cur.x, cur.y);
ev({ type: "move", t: now(), x: cur.x, y: cur.y });

const sleep = (ms) => page.waitForTimeout(ms);
const caption = (text) => page.evaluate((t) => window.stage.caption(t), text);

async function moveTo(to, ms = 650) {
  const steps = Math.max(12, Math.round(ms / 16));
  const from = cur;
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const x = from.x + (to.x - from.x) * e, y = from.y + (to.y - from.y) * e;
    await page.mouse.move(x, y);
    ev({ type: "move", t: now(), x: Math.round(x), y: Math.round(y) });
    await sleep(ms / steps);
  }
  cur = to;
}

async function clickOn(loc, { pause = 1000, effect } = {}) {
  const b = await loc.boundingBox();
  if (!b) throw new Error("클릭 대상을 못 찾았다");
  const point = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
  await moveTo(point);
  await page.mouse.down();
  // effect: 결과가 버튼에서 먼 곳에 생기는 클릭은 그 영역을 bbox 로 남긴다 — verify 의 「클릭이 먹었나」가 bbox 둘레만 본다.
  const box = effect ?? b;
  ev({ type: "down", t: now(), x: point.x, y: point.y, bbox: [box.x, box.y, box.width, box.height].map(Math.round) });
  await page.mouse.up();
  await sleep(pause);
}

/** 터미널에 실제로 치고 Enter — 실행은 진짜 셸이 한다. */
async function run(line, { pause = 1200 } = {}) {
  await page.evaluate(() => window.stage.focusTerm());
  for (const ch of line) {
    await page.keyboard.type(ch);
    ev({ type: "key", t: now(), key: ch === " " ? "␣" : ch });
    await sleep(22 + Math.random() * 26);
  }
  await sleep(260);
  const done = page.evaluate(() => new Promise((r) => window.addEventListener("ran", r, { once: true })));
  await page.keyboard.press("Enter");
  ev({ type: "key", t: now(), key: "⏎" });
  await done;
  await sleep(pause);
}

/** 가장 최근 문서 탭을 Playwright 로 직접 찍어 무대에 보여 준다 — 배경 탭의 실제 렌더다. */
async function showDoc(file, meta) {
  const doc = context.pages().find((p) => p.url().endsWith(file));
  if (!doc) throw new Error(`문서 탭이 없다: ${file}`);
  await doc.waitForLoadState();
  // 뷰포트를 바꾸면 같은 창의 무대까지 줄어든다(실측) — 그대로 두고 윗부분만 자른다.
  const jpg = await doc.screenshot({ type: "jpeg", quality: 80, clip: { x: 0, y: 0, width: 820, height: 500 } });
  await page.evaluate(([src, m]) => window.stage.doc(src, m), [`data:image/jpeg;base64,${jpg.toString("base64")}`, meta]);
}

// ── 시나리오 ──────────────────────────────────────────────────────
await caption("Your agent wrote three HTML reports.");
await run("ls", { pause: 900 });

await caption("Open one from the terminal. It lands in a background tab.");
await run("artifact-open test-report.html", { pause: 900 });
await showDoc("test-report.html", "test-report.html · in the background");
await sleep(1500);

await caption("The agent rewrites the file. Same command, same tab: it reloads.");
await run("sed -i '' 's/12 passed/13 passed/g' test-report.html", { pause: 500 });
await run("artifact-open test-report.html", { pause: 900 });
await showDoc("test-report.html", "test-report.html · same tab, reloaded");
await sleep(1700);

await caption("More reports, still no focus change. One list keeps them all.");
await run("artifact-open api-review.html design-notes.html", { pause: 1400 });

await caption("Search the list by title or path.");
await clickOn(panel.locator("#q"), { pause: 350 });
for (const ch of "design") {
  await page.keyboard.type(ch);
  ev({ type: "key", t: now(), key: ch });
  await sleep(90);
}
await sleep(1300);
// 맥에서는 Control+A 가 전체 선택이 아니라 지워지지 않았다(실측) — 사람처럼 한 글자씩 지운다.
for (let i = 0; i < "design".length; i++) {
  await page.keyboard.press("Backspace");
  ev({ type: "key", t: now(), key: "⌫" });
  await sleep(55);
}
await sleep(1000);

await caption("Close tabs: the tabs go away, the list stays.");
// 버튼은 그대로이고 목록·개수가 바뀌므로 패널 전체를 영향 범위로 적는다.
await clickOn(panel.locator("#closeAll"), { pause: 700, effect: await page.locator("#panel").boundingBox() });
await page.evaluate(() => window.stage.clearDoc("closed"));
await sleep(1500);

await caption("Click one to bring it back.");
await sleep(500);
// 다시 열면 그 탭이 앞으로 와서 무대가 가려진다. 그래서 여기서부터는 그 문서 탭의 실제 녹화로 잇는다.
const reopened = context.waitForEvent("page");
await clickOn(panel.locator(".row", { hasText: "Test report" }).first(), { pause: 0 });
const docPage = await reopened;
const cutAt = now();
await docPage.waitForLoadState();
await docPage.waitForTimeout(2600);

const seconds = now();
const stageVideo = page.video();
const docVideo = docPage.video();
await context.close();
const webm = await stageVideo.path();
fs.copyFileSync(await docVideo.path(), path.join(OUT, "reopened.webm"));

// 무대 탭은 t0 보다 먼저 만들어져 영상이 그만큼 앞서 시작한다. 안 맞추면 커서가 클릭보다 늦게 도착한다.
const stageSeconds = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", webm]).toString());
const offset = Math.max(0, stageSeconds - seconds);
const trimStart = offset + startAt;
// 시각 기준을 잘라 낸 뒤의 영상으로 옮기고, 그 앞의 이벤트는 버린다.
for (let i = events.length - 1; i >= 0; i--) {
  const e = events[i];
  if (typeof e.t !== "number") continue;
  e.t = Number((e.t - startAt).toFixed(3));
  if (e.t < 0) events.splice(i, 1);
}
// 클릭 뒤 패널이 갱신되는 모습까지 0.6초 보여 주고 문서 화면으로 넘어간다.
fs.writeFileSync(path.join(OUT, "cut.json"), JSON.stringify({ trimStart: Number(trimStart.toFixed(3)), stageSeconds: Number((cutAt - startAt + 0.6).toFixed(3)) }));
fs.writeFileSync(path.join(OUT, "demo.events.jsonl"), events.filter((e) => e.type !== "note").map((e) => JSON.stringify(e)).join("\n") + "\n");
fs.writeFileSync(path.join(OUT, "commands.log.json"), JSON.stringify(events.filter((e) => e.type === "note"), null, 2));
fs.copyFileSync(webm, path.join(OUT, "stage.webm"));
console.log(`영상 ${webm} · ${seconds.toFixed(1)}초 · 클릭 ${events.filter((e) => e.type === "down").length}`);
console.log(`명령 종료코드: ${events.filter((e) => e.type === "note").map((e) => e.code).join(",")}`);
