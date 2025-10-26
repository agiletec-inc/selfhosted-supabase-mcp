# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- MIT license file and documentation (operations guide, testing strategy, roadmap, vision).
- Authentication-focused automated tests (credential masking, JWT validation, RBAC, session limits).
- GitHub Actions CI workflow for type checking, builds, and test automation.
- Docker-first developer tooling (`Makefile`, `docker-compose.yml`) for containerised workflows.

### Changed
- README development section updated with testing/CI guidance and links to new docs.
- npm scripts now include `typecheck` and unified `test` pipeline using the Node test runner.

### Security
- Credential masking utilities validated by automated tests.
- Human-approval guardrails documented for destructive tools.

## [1.0.0] - 2024-12-01
### Added
- Initial release of the Self-Hosted Supabase MCP server.
- Core database, auth, storage, and realtime tools for single-project deployments.
- Supabase client abstraction with RPC fallback and direct `pg` support.
- Basic auth middleware scaffold and credential masking utilities.***
