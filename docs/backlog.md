# Backlog

Found while building this site. Each item has evidence and a trigger for looking again.

| # | Problem | Evidence | Trigger |
|---|---|---|---|
| 1 | The feedback button says 「피드백」 on an English site. feedback-kit-web has no label or locale prop | `grep 피드백 node_modules/@solhun/feedback-kit-web/dist/index.js` | feedback-kit adds a `labels` or `locale` prop. Belongs to `woorichicken/feedback-kit` |

## 2026-11-09 · 휴대폰 히어로 여백 작업 중 본 것 (feat/promo-video)

- **360 폭에서 머리 메뉴의 「Artifact Dock」이 두 줄로 접힌다** — 넘치거나 잘리지는 않는다(scrollWidth 360/360). 트리거: 360 이하 기기 제보가 오면 로고 글자 크기나 GitHub 버튼 폭을 줄인다. 템플릿(`components/site-header.tsx`) 공통.
- **설치 칸의 클립보드 실패 안내가 한국어다**(`components/install-command.tsx` 「클립보드가 막혀 있어 명령어를 골라 뒀습니다 — ⌘C 로 복사하세요」) — 영어 사이트에서 클립보드가 막힌 브라우저만 본다. 템플릿 공통이라 문구는 `site.config.ts` 로 빼는 게 맞다(「문구는 site.config.ts 에만」 규칙 위반이기도 하다).
