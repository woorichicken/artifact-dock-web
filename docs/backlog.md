# Backlog

Found while building this site. Each item has evidence and a trigger for looking again.

| # | Problem | Evidence | Trigger |
|---|---|---|---|
| 1 | The feedback button says 「피드백」 on an English site. feedback-kit-web has no label or locale prop | `grep 피드백 node_modules/@solhun/feedback-kit-web/dist/index.js` | feedback-kit adds a `labels` or `locale` prop. Belongs to `woorichicken/feedback-kit` |
