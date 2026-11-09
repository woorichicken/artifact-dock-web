# Backlog

Found while building this site. Each item has evidence and a trigger for looking again.

| # | Problem | Evidence | Trigger |
|---|---|---|---|
| 1 | The feedback button says 「피드백」 on an English site. feedback-kit-web has no label or locale prop | `grep 피드백 node_modules/@solhun/feedback-kit-web/dist/index.js` | feedback-kit adds a `labels` or `locale` prop. Belongs to `woorichicken/feedback-kit` |
| 2 | At 360 px the header logo text "Artifact Dock" wraps to two lines. Nothing overflows (scrollWidth 360/360) | `review/artifact-dock/promo-r3/shots/after-360.png` (2026-11-09) | A report from a 360 px or narrower device. Shrink the logo text or the GitHub button in `components/site-header.tsx` (template-wide) |
| 3 | The clipboard-failure hint in the install box is Korean (「클립보드가 막혀 있어 …」) and hard-coded in a component, which breaks the "copy lives in site.config.ts" rule | `components/install-command.tsx` | Next template sync, or a report from a browser that blocks the clipboard. Move the text to `site.config.ts` (template-wide) |
