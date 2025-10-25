# Repository Guidelines

## Project Structure & Module Organization
- `src/` TypeScript source.
  - `src/tools/` MCP tools (one file per tool, snake_case names).
  - `src/auth/` auth, RBAC, audit.
  - `src/client/` Supabase/PG client wrapper.
  - `src/types/` shared types.
- `dist/` build output (generated).
- `test/` ad‑hoc Node tests (`server-test.js`, `credential-test.js`).
- `Makefile`, `docker-compose.yml` Docker-first local dev; `Dockerfile` for image.

## Build, Test, and Development Commands
- Local (Node):
  - `npm install` install deps.
  - `npm run build` bundle to `dist/` via tsup.
  - `npm run dev` watch build (no server auto-run).
  - `npm run typecheck` strict TypeScript check.
  - `npm test` Node test runner (auth/RBAC/security suites).
  - `node dist/index.js --help` run MCP server.
- Docker-first (recommended):
  - `make up` start workspace container.
  - `make install` install deps in container (pnpm).
  - `make build` build in container.
  - `make dev` watch build in container.
  - `make typecheck` TypeScript `--noEmit`.
  - `make test` run tests inside container.
  - `make down` stop workspace.

## Coding Style & Naming Conventions
- TypeScript, ESM (`type: module`), strict mode enabled.
- Indentation 4 spaces; semicolons required; single quotes.
- Naming: camelCase for vars/functions, PascalCase for types, snake_case for tool filenames and MCP tool names (e.g., `src/tools/list_tables.ts`, name: `list_tables`).
- No linter configured; keep imports sorted, narrow types, prefer `zod` schemas for IO.

## Testing Guidelines
- Framework: none; tests are executable Node scripts in `test/`.
- Add new tests as runnable scripts under `test/` with clear console output.
- Aim to cover tool happy-paths and credential masking; no formal coverage gate.

## Commit & Pull Request Guidelines
- Commits: concise, imperative. Prefer Conventional Commits when possible (e.g., `feat:`, `fix:`). Group related changes.
- PRs: include purpose, key changes, how to run/test, and security impact (credentials, auth, migrations). Link issues. Add screenshots of terminal output when useful.

## Security & Configuration Tips
- Never commit real keys or URLs. Use env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_AUTH_JWT_SECRET`.
- Use `--tools-config` to whitelist tools; avoid `--disable-auth` outside local dev. See `SECURITY.md` for RBAC and approval flows.
