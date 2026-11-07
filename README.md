# Artifact Dock website

The homepage for [Artifact Dock](https://github.com/woorichicken/artifact-dock), a Chrome extension and CLI for macOS that opens agent-generated HTML in background tabs, one tab per document, listed in a side panel.

Live at **https://artifact-dock.solhun.com**.

Built from `oss-landing-template`. All site copy, links, and media paths live in [`site.config.ts`](site.config.ts). Components only read from it.

## Routes

| Path | Content |
| --- | --- |
| `/` | Hero video, install command, quick start, features, contributors, FAQ |
| `/docs` | Install steps and links to the guides in the Artifact Dock README |
| `/changelog` | Release notes, stored in the database and added through the API |
| `/roadmap` | Planned work, stored in the database |
| `/feedback` | User reports, votes, and comments |
| `/admin/*` | Management screens (not indexed) |
| `/api/*` | Read and write APIs for the three above |

Stack: Next.js 14 (App Router), Tailwind v4, Neon Postgres with Drizzle, Vercel.

## Develop

```bash
pnpm install
cp .env.example .env.local     # DATABASE_URL, ADMIN_API_KEY, feedback widget values
pnpm db:generate && pnpm db:migrate
pnpm dev -p 3232
```

`drizzle-kit` does not read `.env.local`, so pass `DATABASE_URL` in the environment when you migrate.

## Write API

Agents add release notes and roadmap items through the API with `Authorization: Bearer $ADMIN_API_KEY`. The skills in `.claude/skills/` (`site-changelog`, `site-roadmap`, `site-feedback`) wrap these calls. With no `ADMIN_API_KEY`, every write returns 401.

## Demo video

The hero and feature clips are recorded from the real extension, native host, and CLI. See [`scripts/README.md`](scripts/README.md).

## License

MIT
