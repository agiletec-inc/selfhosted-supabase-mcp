# Self-Hosted Supabase MCP Server Operations Guide

This document summarizes the operational practices required to run the MCP server in production-grade self-hosted environments.

## 1. Environment & Configuration
- **Runtime**: Node.js 20 LTS or newer, npm 10+. Container deployments should track the same runtime (see `Dockerfile`).
- **Secrets**: Provide `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and (recommended) `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SUPABASE_AUTH_JWT_SECRET` via a secret manager or orchestrator (Docker secrets, Kubernetes, HashiCorp Vault). Never bake credentials into images.
- **Tool whitelist**: Supply `--tools-config` to restrict exposed tools for each deployment. At minimum disable `execute_sql`, `apply_migration`, and Auth write operations in read-only environments.
- **Audit logging**: Leave authentication enabled with `--jwt-secret` unless in isolated local development. The built-in audit logger writes to stderr; ship logs to centralized storage (e.g., Loki, CloudWatch).

## 2. Authentication, RBAC, and Credential Hygiene
- Issue short-lived JWT tokens signed with `SUPABASE_AUTH_JWT_SECRET`. Encode roles (`admin`, `service_role`, `operator`, `authenticated`) and explicit permissions (`write:auth_users`, `execute:sql`) in the token payload.
- Align tokens with `allowedAudiences` / `allowedIssuers` defined in `src/index.ts`. If you customise the lists, update `AuthConfig` and redeploy.
- Configure human approval requirements through `AuthConfig.requireHumanApproval`. The defaults already cover `execute_sql`, `apply_migration`, and `delete_auth_user`.
- Leverage the credential masking utilities: tool responses mask keys automatically, but confirm by running `npm test` or the targeted credential masking test after any change touching logging or serialization.

## 3. Deployment Workflow
1. `npm ci`
2. `npm run build`
3. `npm test` (runs type checking and automated security/unit checks)
4. Package the contents of `dist/` into your preferred artifact (Docker image, tarball).
5. Deploy with environment variables injected at runtime. Example systemd unit snippets are provided in `README.md`.

## 4. Runtime Operations
- **Health checks**: Wrap `node dist/index.js --help` or a `tools/list` request in your liveness probes. A failing probe should trigger re-scheduling.
- **Log review**: Pipe stderr/stdout to your log aggregator. Authentication and authorization failures are already categorized (success/failure/error). Parse for `AUTH_` and `SESSION_` codes.
- **Session cache**: The default in-memory session store suits single-instance deployments. For HA setups, replace `SessionManager` with Redis or a database-backed implementation (see `src/auth/session.ts`).
- **Database safety**: Require `DATABASE_URL` for production so privileged tools operate through direct connections with better auditing. Pair with read-only database roles for non-admin tokens.

## 5. Maintenance & Upgrades
- Rotate Supabase keys regularly. After rotation, restart the MCP server to pick up new environment variables and invalidate old sessions.
- Run `npm audit` and `npm outdated` monthly; schedule dependency updates through CI using the new workflow (`.github/workflows/ci.yml`).
- Review the tool whitelist after each release to ensure dangerous tools stay disabled where not needed.
- Maintain backups of Supabase database and bucket metadata prior to invoking `apply_migration` or other write tools.

## 6. Incident Response Checklist
- Revoke compromised tokens by rotating `SUPABASE_AUTH_JWT_SECRET` and clearing sessions (`SessionManager.destroyUserSessions`).
- Inspect audit log output for the session IDs associated with the event. Correlate with Supabase's Postgres logs for low-level actions.
- Temporarily disable high-risk tools by editing the `--tools-config` file and restarting the server.
- Validate that credential masking still prevents accidental disclosure in logs after mitigation.

## 7. Release Validation
- Automated checks: `npm test`, `npm run build`. The CI pipeline replicates this flow.
- Manual smoke test: call `tools/list` and a read-only tool (e.g., `list_tables`) against a staging Supabase instance.
- Regenerate documentation or client libraries (`generate_typescript_types`) only from sanitized environments; confirm masked outputs.

Follow this guide with the security requirements in `SECURITY.md` to maintain a production-ready deployment. Update the checklist whenever new tools or authentication flows are added.
