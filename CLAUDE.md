# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server for self-hosted Supabase instances. It provides tools for database introspection, management, schema operations, auth user management, storage insights, and more - all through the MCP protocol.

The server is designed to be minimal and focused, avoiding cloud-specific complexities while supporting both Supabase REST API interactions (via `@supabase/supabase-js`) and direct PostgreSQL connections (via `pg` library).

## Build and Development Commands

### Docker-First Development (Recommended)

This project uses Docker-first development to avoid polluting the macOS host:

```bash
# Start development workspace
make up

# Install dependencies (in container)
make install

# Build the TypeScript code
make build

# Start dev watch mode
make dev

# Enter workspace shell
make workspace

# Stop workspace
make down
```

### Direct Development (Alternative)

```bash
# Install dependencies
npm install

# Type check the project
npm run typecheck

# Run automated tests
npm test

# Build the project bundle
npm run build

# Watch mode for development
npm run dev

# Run the server
npm start
```

## Running the Server

The server requires configuration via CLI arguments or environment variables:

```bash
# Minimum required configuration
node dist/index.js \
  --url http://localhost:8000 \
  --anon-key <your-anon-key>

# Full configuration with authentication
node dist/index.js \
  --url http://localhost:8000 \
  --anon-key <anon-key> \
  --service-key <service-key> \
  --db-url postgresql://postgres:password@localhost:5432/postgres \
  --jwt-secret <jwt-secret> \
  --auth-token <jwt-token>

# With tool whitelisting
node dist/index.js \
  --url http://localhost:8000 \
  --anon-key <anon-key> \
  --tools-config ./mcp-tools.json
```

## Architecture

### Core Components

1. **SelfhostedSupabaseClient** (`src/client/index.ts`)
   - Dual-mode SQL execution: RPC (`public.execute_sql` function) and direct PostgreSQL connection
   - Auto-creates `execute_sql` helper function if missing (requires service key + db-url)
   - Manages connection pooling for PostgreSQL direct access
   - Provides transactional operations via `executeTransactionWithPg()`

2. **Authentication Framework** (`src/auth/`)
   - JWT-based authentication with role-based access control (RBAC)
   - Session management with timeout and concurrent session limits
   - Credential masking for sensitive data (keys, secrets)
   - Audit logging for security events
   - Human-in-the-loop approval for dangerous operations
   - Roles: `anon`, `authenticated`, `operator`, `service_role`, `admin`

3. **MCP Server** (`src/index.ts`)
   - Main entry point that initializes the MCP server via stdio transport
   - Tool registration and filtering based on configuration
   - Request handling for `ListTools` and `CallTool`
   - Integration of authentication middleware
   - Context creation for tool execution (client, auth, logger)

4. **Tools** (`src/tools/`)
   - Each tool is a standalone module with:
     - Zod schema for input validation (`inputSchema`)
     - Static JSON schema for MCP protocol (`mcpInputSchema`)
     - Execute function receiving parsed input and `ToolContext`
   - Tools use either RPC or direct PostgreSQL based on requirements
   - Auth tools and storage tools require direct database access

### Key Design Patterns

- **Async Factory Pattern**: `SelfhostedSupabaseClient.create()` handles async initialization
- **Context Object**: `ToolContext` provides tools with client, auth, workspace path, and logger
- **Dual Execution Modes**: Tools choose between RPC (via Supabase API) or direct PostgreSQL
- **Schema Separation**: Zod schemas for validation, separate JSON schemas for MCP protocol
- **Credential Masking**: Sensitive values are masked in responses using `maskCredential()` from `src/auth/credentials.ts`

### Authentication Flow

1. Server initializes `AuthenticationMiddleware` if `--jwt-secret` provided
2. On tool call, token is validated via `authenticateToken()`
3. Tool access is checked via `validateToolAccess()` (RBAC + permissions)
4. Dangerous operations may require human approval (non-admin users)
5. All security events are logged via `AuditLogger`

### SQL Execution Strategy

The client attempts RPC first, falls back to direct PostgreSQL:

1. **RPC Method** (`executeSqlViaRpc`): Calls `public.execute_sql` function via Supabase REST API
2. **Direct Method** (`executeSqlWithPg`): Uses `pg` library for direct PostgreSQL connection
3. **Transactional Method** (`executeTransactionWithPg`): For operations requiring ACID guarantees

Tools that need direct access:
- Auth tools (access `auth.users` schema)
- Storage tools (access `storage` schema)
- Migration tools (need transactional DDL)
- System catalog queries (`pg_catalog`, `pg_stat_*`)

### Tool Configuration

Tools can be whitelisted via JSON config file:

```json
{
  "enabledTools": ["list_tables", "execute_sql", "get_project_url"]
}
```

This is useful for limiting capabilities in production or multi-tenant scenarios.

## Important Implementation Notes

### When Adding New Tools

1. Create tool file in `src/tools/`
2. Define Zod input schema and static JSON schema (`mcpInputSchema`)
3. Implement `execute` function with signature: `(input, context: ToolContext) => Promise<unknown>`
4. Export tool object with: `name`, `description`, `inputSchema`, `mcpInputSchema`, `execute`
5. Import and register in `src/index.ts` `availableTools` object
6. Consider RBAC permissions in tool implementation
7. Use `context.auth` to check user roles/permissions
8. Use credential masking for sensitive outputs

### SQL Execution Decision Tree

- **Simple read-only queries**: Use RPC if available, fallback to direct
- **System catalog queries** (`pg_catalog`, `information_schema`): Require direct PostgreSQL
- **Auth/Storage operations**: Require direct PostgreSQL (privileged schemas)
- **Migrations/DDL**: Require direct PostgreSQL with transactions
- **Cross-schema operations**: Require direct PostgreSQL

### Security Considerations

- **Never expose raw credentials**: Always use `maskCredential()` from `src/auth/credentials.ts`
- **Validate tool access**: Check `context.auth.roles` and `context.auth.permissions`
- **Dangerous operations**: Add to `requireHumanApproval` array in auth config
- **Audit logging**: Use `context.log()` or `auditLogger` for security events
- **Production deployments**: Always enable authentication (`--jwt-secret` and `--auth-token`)

## TypeScript Configuration

The project uses ES modules (`"type": "module"` in package.json) with:
- `target`: ES2022
- `module`: NodeNext
- `moduleResolution`: NodeNext
- Strict mode enabled
- Source maps for debugging

All imports must use `.js` extension (TypeScript ES module requirement).

## Testing

- `npm test` runs the Node test runner (via `tsx`) and covers credential masking, JWT validation, RBAC rules, and session limits.
- `npm run typecheck` performs TypeScript validation without emitting files.
- Legacy scripts in `test/` (for example `server-test.js`) remain useful for manual experiments but are not executed in CI.

## Common Gotchas

1. **RPC function not found**: Server auto-creates `execute_sql` if service-role key and db-url are provided.
2. **Authentication disabled warning**: Production should always use `--jwt-secret` and pass a valid `--auth-token`.
3. **Tool access denied**: Check JWT roles/permissions and `requireHumanApproval` settings.
4. **PostgreSQL connection failures**: Verify the `--db-url` format and that the host allows connections from the MCP server.
5. **PostgREST schema cache**: Server sends `NOTIFY pgrst, 'reload schema'` after creating `execute_sql`, but PostgREST may still need a manual restart if the cache is stale.

## Reference Docs

- Operations guide: `docs/operations.md`
- Load & failure testing strategy: `docs/testing-strategy.md`
- Roadmap: `ROADMAP.md`
- Vision: `VISION.md`
- Changelog: `CHANGELOG.md`
