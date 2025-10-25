# Self-Hosted Supabase MCP Server – Roadmap

_Last updated: 2025-02-10_

This roadmap captures the planned evolution of the self-hosted Supabase MCP server. It focuses on production readiness, security, and parity with cloud tooling without compromising the lean self-hosted footprint.

## ✅ Recently Delivered
- Authentication middleware with JWT validation, RBAC, and session controls.
- Credential masking utilities and automated tests.
- Storage, auth, realtime, and migration tools covering core Supabase operations.
- CI pipeline (GitHub Actions) for type checking, builds, and automated tests.
- Operations and testing playbooks for production deployments.

## 🟢 Near Term (Q1 2025)
1. **Tooling Hardening**
   - Add read/write separation and configurable approval policies per environment.
   - Improve error surfaces with structured MCP responses and remediation hints.
2. **Integration Tests**
   - Spin up ephemeral Supabase containers to run end-to-end tool scenarios.
   - Include regression tests for migrations, storage access, and credential masking.
3. **Packaging Improvements**
   - Publish Docker image (multi-arch) and `npx` installer with default config scaffold.
   - Provide sample `mcp.json` templates for Cursor, VS Code Copilot, and Windsurf.

## 🟡 Mid Term (Q2 2025)
1. **Expanded Tool Catalog**
   - Edge function insight tools (list deployments, tail logs).
   - Storage mutations (create/delete buckets, signed URL generation) behind approvals.
2. **Observability**
   - Structured audit log output (JSONL) and optional OpenTelemetry hooks.
   - Health/metrics endpoint for containerized deployments.
3. **Enterprise Controls**
   - Pluggable session store (Redis/Postgres) for HA environments.
   - Policy-as-code integration to map Supabase roles to MCP tools automatically.

## 🟠 Long Term (H2 2025+)
1. **Supabase Feature Parity**
   - Log access abstraction for self-hosted deployments (pgAudit, Falco integration).
   - Function deployment orchestration (edge functions, pg_net jobs).
2. **Multi-Project Operations**
   - Optional project switcher for teams hosting multiple Supabase stacks.
   - Context isolation, per-project secret stores, and bulk operations.
3. **Workflow Automation**
   - First-class support for GitHub Actions / CI agents with human-in-the-loop approvals.
   - Blue/green migration helpers and drift detection tooling.

## 📬 Feedback
Roadmap priorities come from real deployments. File issues or start discussions to influence the queue. Production adoption stories and pain points are especially valuable.***
