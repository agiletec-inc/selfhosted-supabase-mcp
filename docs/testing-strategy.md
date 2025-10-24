# Load & Failure Testing Strategy

This document outlines how to validate the Model Context Protocol server under production-level workloads and failure scenarios. Use it alongside `docs/operations.md` before promoting a release.

## 1. Performance & Load Testing

1. **Scenario design**
   - Identify critical tool invocations: schema introspection (`list_tables`, `list_extensions`), read-only SQL, write-heavy operations (`apply_migration`, `execute_sql` with DDL), Auth management.
   - Acquire anonymised Supabase datasets representing small (≤1 GB), medium (~10 GB), and large (>50 GB) deployments.

2. **Tooling**
   - Use [k6](https://k6.io) or [Artillery](https://www.artillery.io) to generate concurrent MCP requests via stdio bridges.
   - For database-focused exercises, combine MCP load with direct PostgreSQL profiling (`pg_stat_statements`, `EXPLAIN ANALYZE`) or `pgbench`.

3. **Metrics to capture**
   - Response time (p50/p95/p99) per tool.
   - CPU and memory usage of the MCP process and Supabase PostgREST/pg nodes.
   - Connection pool utilization (`get_database_connections` output) and error rates.
   - Queue depth / back-pressure when `execute_sql` falls back to RPC.

4. **Acceptance thresholds**
   - p95 latency < 750 ms for read-only tools (list/read operations) under expected peak concurrency.
   - p99 latency < 2 s for write operations (`apply_migration`) when database round-trips dominate.
   - Zero failed authentications for valid tokens; <0.1% transient failures overall.

5. **Artifacts**
   - Archive k6/Artillery scripts under `test/load/`.
   - Store raw metrics and dashboards (Grafana/Datadog) per test run for regression tracking.

## 2. Resilience & Failure Testing

1. **Authentication failures**
   - Revoke JWT secrets during active sessions to ensure the middleware blocks new requests and logs `AUTH_INVALID_AUDIENCE` / `AUTH_INVALID_ISSUER`.
   - Force session exhaustion (`maxConcurrentSessions`) to confirm graceful denials and audit entries.

2. **Network & dependency failures**
   - Simulate PostgREST outages (block HTTP) to verify the client flips to direct `pg` connections.
   - Kill PostgreSQL connections mid-query to confirm the pool recovers and errors propagate as `PG_ERROR` or `MCP_RPC_EXCEPTION`.

3. **Tool safeguards**
   - Attempt destructive SQL as non-admin roles; expect `AUTH_DANGEROUS_SQL`.
   - Trigger human-approval-required tools with missing approvals to confirm `AUTH_HUMAN_APPROVAL_REQUIRED`.

4. **Process supervision**
   - Run under systemd/supervisord with forced crashes to ensure auto-restart and audit log flushing.

## 3. Release Gate Checklist

- [ ] Load test reports attached (p95/p99 latencies within thresholds).
- [ ] Resilience scenarios executed with documented outcomes.
- [ ] No unmasked credentials in logs during stress.
- [ ] CI pipeline green (`npm test`, `npm run build`) on the release branch.
- [ ] Operations guide updated with any new mitigations or lessons.

Implement the automated checks gradually—start with scripted load tests against staging environments, then integrate them into CI/CD pipelines once stable.
