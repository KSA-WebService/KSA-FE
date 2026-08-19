# CLAUDE.md

## Project

KSA-FE is the frontend for the HKUST Korean Students Association (KSA) web service.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Supabase Auth via `@supabase/ssr` (Auth only — no `supabase.from(...)`, no Data API; all KSA application data goes through the NestJS API)
- TanStack Query for data fetching/caching
- Radix primitives styled in a shadcn-pattern (`src/components/ui`)
- Sonner for toasts, Lucide for icons

Before adding any further dependency, check `package.json` and follow the existing conventions — do not introduce a new framework, package manager, or major dependency without checking first.

## Admin specifications

Admin work is governed by three spec docs. Each is the source of truth for its domain — don't duplicate or restate their content here, and don't guess when something isn't covered by them:

- `docs/admin/product.md` — global product/design/UX rules
- `docs/admin/admin-ui.md` — page behavior and interaction
- `docs/admin/api-contract.md` — backend API requests/responses

Never invent API endpoints, enum values, request fields, or response fields. If `api-contract.md` doesn't define it, ask rather than assume.

## Backend boundary

- Do not modify backend code from this repo.
- API JSON uses camelCase; external enum-like values use lowercase snake_case.
- API responses are wrapped as `resultType` / `error` / `success`.
- Admin API requests require the Supabase administrator access token where the contract specifies it.

## Secrets

- Never expose backend secrets in frontend code.
- Never put `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `DATABASE_URL`, or any other backend secret into `NEXT_PUBLIC_*` variables.

## Language

- Short UI labels, buttons, table headers, and statuses: English.
- Explanatory text, errors, warnings, confirmations, validation messages: Korean.

## Formatting

- Display admin dates/times in `Asia/Hong_Kong`.

## Code

- Reuse shared components rather than duplicating page-specific implementations.

## Git

- Do not commit, push, merge, or change branches unless explicitly asked.

## Before declaring work complete

Run the repository's lint/build checks (per `package.json` scripts) and confirm they pass.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
