// 데모 무대. 값은 전부 실제다 — 터미널은 진짜 셸의 출력, 탭 목록은 chrome.tabs 응답,
// 오른쪽은 확장의 진짜 sidepanel.html. 여기서 지어내는 값은 없다.
const $ = (id) => document.getElementById(id);
const myTabId = (await chrome.tabs.getCurrent()).id;

function short(title, url) {
  return title || (url || "").split("/").pop() || "loading…";
}

async function drawTabs() {
  const all = await chrome.tabs.query({ currentWindow: true });
  $("count").textContent = all.length;
  $("countLabel").textContent = all.length === 1 ? "tab" : "tabs";
  const active = all.find((t) => t.active);
  $("active").textContent = active?.id === myTabId ? "this tab" : short(active?.title, active?.url);
  $("tabs").replaceChildren(...all.map((t) => {
    const li = document.createElement("li");
    li.classList.toggle("is-active", t.active);
    li.textContent = t.id === myTabId ? "This tab" : short(t.title, t.url);
    const tag = document.createElement("span");
    tag.textContent = t.active ? "  · active" : "  · background";
    li.append(tag);
    return li;
  }));
}
for (const ev of ["onCreated", "onRemoved", "onUpdated", "onActivated", "onMoved"]) chrome.tabs[ev].addListener(drawTabs);
drawTabs();

function print(text, cls) {
  const line = document.createElement("div");
  line.className = cls;
  line.textContent = text;
  $("log").append(line);
}

// Enter 를 누르면 입력한 글자 그대로 진짜 셸에서 돈다(runShell 은 녹화 스크립트가 넘겨 준다).
$("cmd").addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  const line = e.target.value;
  e.target.value = "";
  print(line, "ran");
  const { stdout, stderr } = await window.runShell(line);
  if (stdout.trim()) print(stdout.trimEnd(), "out");
  if (stderr.trim()) print(stderr.trimEnd(), "err");
  window.dispatchEvent(new CustomEvent("ran"));
});

window.stage = {
  caption: (text) => { $("caption").textContent = text; },
  doc: (src, meta) => { const i = $("thumb"); i.src = src; i.hidden = false; $("docMeta").textContent = meta; },
  clearDoc: (meta) => { const i = $("thumb"); i.hidden = true; i.removeAttribute("src"); $("docMeta").textContent = meta; },
  focusTerm: () => $("cmd").focus(),
};
$("cmd").focus();
window.stageReady = true;
