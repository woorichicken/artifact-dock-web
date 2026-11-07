/**
 * 이 파일 하나만 고치면 사이트 내용이 전부 바뀐다.
 *
 * 컴포넌트는 여기서 읽기만 한다 — 문구·링크·이미지를 컴포넌트 안에 직접 쓰지 않는다.
 * 그래야 다음 프로젝트가 "복사해서 내용만 바꾸기"로 끝난다.
 *
 * 채워야 할 곳은 전부 TODO(create-opensource) 로 표시해 뒀다.
 */

// ─────────────────────────────────────────────────────────────
// 정체성
// ─────────────────────────────────────────────────────────────
/**
 * 플레이스홀더는 GitHub 에 **실재하지 않는 이름**이어야 한다.
 * `your-org/your-repo` 는 실제로 존재해서, 채우기 전 미리보기에 남의 저장소
 * 별 개수가 그대로 떴다(실측). 채우기 전 상태는 배지가 비어 있는 게 맞다.
 */
export const repo = {
  owner: "woorichicken",
  name: "artifact-dock",
  branch: "main",
} as const;

export const repoUrl = `https://github.com/${repo.owner}/${repo.name}`;

export const site = {
  /** 제품/프로젝트 이름. 헤더·OG·JSON-LD 에 그대로 쓴다. */
  name: "Artifact Dock",
  /** 한 줄. 검색 결과와 OG 설명의 첫 문장이 된다. */
  tagline: "Agent-generated HTML opens in a background tab, one tab per document, listed in a side panel.",
  /** 두세 문장. meta description 으로 나간다(155자 안쪽 권장). */
  description:
    "Chrome extension and CLI for macOS. Agent-generated HTML opens in background tabs, one tab per document, listed in a side panel. Your focus stays put.",
  /** 배포 도메인. metadataBase·sitemap·canonical 의 기준. */
  url: "https://artifact-dock.solhun.com",
  lang: "en",
  locale: "en_US",
  logo: "/logo.svg",
  /** OG 이미지(1200x630). 없으면 데모 이미지를 쓴다. */
  ogImage: "/og.png",
  license: "MIT",
  /** 검색 키워드. 과하게 넣지 않는다 — 5~12개. */
  keywords: ["chrome extension", "side panel", "background tab", "claude code", "codex", "html report", "tab management", "macos", "cli", "open source"],
} as const;

// ─────────────────────────────────────────────────────────────
// 설치 — OSS 홈페이지에서 가장 많이 복사되는 한 줄
// ─────────────────────────────────────────────────────────────
export type InstallOption = { label: string; command: string };

export const install: {
  /** 히어로 바로 아래에 기본으로 뜨는 탭 */
  options: InstallOption[];
  /** 설치 뒤 확인용 한 줄(선택). 없으면 렌더 안 함. */
  verify?: string;
  /** verify 앞에 붙는 안내(선택). 명령만 덩그러니 있으면 무엇인지 안 읽힌다. */
  verifyLabel?: string;
} = {
  options: [
    { label: "bash", command: "git clone https://github.com/woorichicken/artifact-dock.git && cd artifact-dock && ./install.sh" },
    { label: "CLI only", command: "git clone https://github.com/woorichicken/artifact-dock.git && cd artifact-dock && ./install.sh --cli-only" },
  ],
  verify: "artifact-open --status",
  verifyLabel: "Add the extension from the Chrome Web Store, then check the connection:",
};

/** 30초 안에 뭔가 돌아가는 최소 예제. 히어로 다음에 온다. */
export const quickStart: { language: string; code: string } = {
  language: "bash",
  code: `# Opens in a background tab
artifact-open report.html

# Several at once
artifact-open a.html b.html

# File changed? Same tab reloads
artifact-open report.html`,
};

// ─────────────────────────────────────────────────────────────
// 히어로
// ─────────────────────────────────────────────────────────────
export const hero = {
  /** 로고 옆 작은 배지. 없애려면 null. */
  badge: { text: "MIT · macOS · Chrome extension + CLI" },
  /** 배열의 각 원소가 한 줄. 2줄이 가장 안정적이다. */
  title: ["Agent reports open", "without stealing focus"],
  subtitle:
    "Stop Chrome jumping over your terminal every time an agent writes HTML. Each document gets one background tab and one row in a side panel.",
  primaryCta: { label: "Get started", href: "#install" },
  secondaryCta: { label: "GitHub", href: repoUrl },
  /** 히어로 스크롤 애니메이션 안에 들어갈 데모. mp4 또는 이미지. */
  media: {
    type: "video" as "image" | "video",
    src: "/demo.mp4",
    /** 영상이 뜨기 전·자동재생이 막혔을 때 보이는 정지 화면. 영상이면 넣는다. */
    poster: "/demo-poster.png" as string | undefined,
    alt: "A terminal runs artifact-open: each report lands in a background tab and a side panel row, a rewritten report reloads the same tab, and closed documents reopen from the list",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// 기능 섹션 — 좌우 번갈아 배치된다
// ─────────────────────────────────────────────────────────────
export type Feature = {
  title: string;
  body: string;
  link?: { label: string; href: string };
  media: { type: "image" | "video"; src: string; alt: string };
};

export const featuresIntro = {
  badge: "Key Features",
  heading: "Quiet tabs, one list",
  body: "The open command brings all of Chrome forward, even with -g. A CLI can't prevent that, but an extension can, so Artifact Dock is both.",
};

export const features: Feature[] = [
  {
    title: "Opens behind you",
    body: "artifact-open asks the extension over a local socket, and the extension creates a tab without activating it. You keep typing in the terminal and the tab you were on stays active.",
    link: { label: "Why a CLI alone can't do it →", href: `${repoUrl}#why-a-cli-alone-cant-do-it-measured` },
    media: { type: "video", src: "/feature-background.mp4", alt: "artifact-open adds a background tab while the active tab stays the same" },
  },
  {
    title: "Same file, same tab",
    body: "When an agent rewrites a report, run the same command. Artifact Dock finds the tab by file path and reloads it, so copies never pile up. It can also match by file name or title.",
    link: { label: "Matching rules →", href: `${repoUrl}#when-the-same-document-doesnt-merge` },
    media: { type: "video", src: "/feature-reload.mp4", alt: "After the file changes, artifact-open prints reused, the tab count stays the same, and the report shows the new content" },
  },
  {
    title: "A list, not a full tab bar",
    body: "Every document sits in the side panel, newest first, searchable by title, folder, and path. Close the tabs and the list stays, so any document comes back with one click.",
    link: { label: "The side panel →", href: `${repoUrl}#the-side-panel-list` },
    media: { type: "video", src: "/feature-list.mp4", alt: "Searching the side panel, then closing tabs while the documents stay listed under Recently closed" },
  },
];

// ─────────────────────────────────────────────────────────────
// FAQ — JSON-LD(FAQPage)로도 나가니 실제 질문만 쓴다
// ─────────────────────────────────────────────────────────────
export const faq: { question: string; answer: string }[] = [
  {
    question: "Why not just use open -g?",
    answer:
      "Neither open -g nor AppleScript's make new tab stops it: Chrome brings itself forward. The only path that leaves focus alone is the extension creating the tab with tabs.create({active:false}).",
  },
  {
    question: "Which platforms does it support?",
    answer:
      "macOS only. The socket path and the handoff of non-HTML files to /usr/bin/open assume macOS. The installer registers the native host for Chrome, Chrome Canary, Chromium, Brave, and Edge.",
  },
  {
    question: "What happens if the extension isn't connected?",
    answer:
      "artifact-open exits with an error and does not open the file. It never falls back to AppleScript or macOS open, because that would pull Chrome forward again.",
  },
  {
    question: "Do I still need install.sh with the Chrome Web Store version?",
    answer:
      "Yes. An extension can't install local programs, so the CLI and native host always come from install.sh. Both the Web Store and source builds are allowed to connect.",
  },
  {
    question: "Can my agent set it up for me?",
    answer:
      "Yes. Copy the setup prompt from the setup tab or the robot button in the side panel and paste it into Claude Code or Codex. The agent runs the install, fixes PATH, and checks that a test page opens in the background.",
  },
  {
    question: "Does it send my data anywhere?",
    answer:
      "No. The extension makes no network requests of its own and has no analytics. Tab titles, settings, and the document list stay in your browser, and the local host only checks whether a listed file still exists.",
  },
  {
    question: "What license is Artifact Dock under?",
    answer:
      "MIT. You can use it commercially, modify it, and redistribute it, as long as you keep the copyright notice.",
  },
  {
    question: "How do I report a bug?",
    answer: `Run ./doctor.sh first, then open an issue at ${repoUrl}/issues with the result and the version shown at the bottom of the side panel.`,
  },
];

// ─────────────────────────────────────────────────────────────
// 후원 — 결제 대신 들어가는 자리. 안 쓰면 enabled: false
// ─────────────────────────────────────────────────────────────
export const sponsor = {
  enabled: false,
  heading: "Support the project",
  body: "This project is maintained in the open. Sponsorship funds the time it takes.",
  cta: { label: "Sponsor on GitHub", href: `https://github.com/sponsors/${repo.owner}` },
};

// ─────────────────────────────────────────────────────────────
// 마지막 CTA
// ─────────────────────────────────────────────────────────────
export const cta = {
  heading: "Keep your place",
  body: "No signup. No account. Read the source before you run it.",
};

// ─────────────────────────────────────────────────────────────
// 네비게이션 — 없는 페이지를 넣지 않는다(404 로 신뢰를 깎는다)
// ─────────────────────────────────────────────────────────────
export const nav: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Resources",
    items: [
      { href: "/docs", label: "Docs" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/roadmap", label: "Roadmap" },
      { href: "/feedback", label: "Feedback" },
    ],
  },
];

export const footer = {
  columns: [
    {
      title: "Project",
      links: [
        { label: "Docs", href: "/docs" },
        { label: "Changelog", href: "/changelog" },
        { label: "Roadmap", href: "/roadmap" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "GitHub", href: repoUrl },
        { label: "Issues", href: `${repoUrl}/issues` },
        { label: "Feedback", href: "/feedback" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "License", href: `${repoUrl}/blob/${repo.branch}/LICENSE` },
        { label: "Privacy", href: `${repoUrl}/blob/${repo.branch}/PRIVACY.md` },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 사이트 검증 코드 — 없으면 비워 둔다(빈 값이 들어가면 태그를 안 만든다)
// ─────────────────────────────────────────────────────────────
export const verification: Record<string, string> = {
  // "naver-site-verification": "...",
  // "google-site-verification": "...",
};

// ─────────────────────────────────────────────────────────────
// /docs 페이지 — 진짜 문서가 따로 있으면 여기서 링크만 보낸다
// ─────────────────────────────────────────────────────────────
export const docs = {
  heading: "Documentation",
  body: "Install the CLI and the extension, open your first report, then read the guides below.",
  /** 외부 문서 사이트가 있으면 채운다. 없으면 null → 버튼을 그리지 않는다. */
  externalUrl: null as string | null,
  guides: [
    {
      title: "Getting started",
      description: "Install, load the extension, and check the connection.",
      href: `${repoUrl}#install`,
    },
    {
      title: "Chrome Web Store",
      description: "The published extension. You still run install.sh for the CLI and native host.",
      href: "https://chromewebstore.google.com/detail/artifact-dock/nfifnjdpmjacfelfapgeibnnbkokceim",
    },
    {
      title: "Settings",
      description: "Matching rules, tab groups, tab limits, and automatic cleanup.",
      href: `${repoUrl}#settings-extension-icon--`,
    },
    {
      title: "Troubleshooting",
      description: "doctor.sh checks the host registration, process, socket, CLI, and Chrome in one go.",
      href: `${repoUrl}#troubleshooting`,
    },
    {
      title: "Privacy policy",
      description: "What the extension reads and where it stays.",
      href: `${repoUrl}/blob/${repo.branch}/PRIVACY.md`,
    },
  ],
}
