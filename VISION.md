# Self-Hosted Supabase MCP Server – Vision

**Maintained by**: Agiletec Inc.  
**Created**: 2025-02-10

---

## 🎯 Mission Statement

**Empower self-hosted Supabase teams to manage their entire stack from any MCP-enabled workspace.**

Self-hosting Supabase gives teams ownership over their data and infrastructure, but day-to-day operations still depend on dashboards, ad-hoc SQL shells, and brittle scripts. The Self-Hosted Supabase MCP Server replaces that fragmentation with one secure, auditable channel that every AI coding assistant and IDE can speak.

We believe operational control should live where developers work—not in a browser tab hidden behind VPN prompts.

---

## 🌍 Problem We Are Solving

### Current State (Pain)
```
Operational Silos:
  - Dashboards for stats
  - CLI scripts for migrations
  - SQL shells for user management

Security Gaps:
  - Service keys pasted into local tooling
  - No centralized audit trail for AI assistants
  - Manual masking of credentials (human error)

Slow Feedback:
  - Waiting for web UI refresh
  - Context switching between tools
  - Limited automation hooks
```

### Future State (Our Vision)
```
Unified Operations:
  IDE / MCP client → selfhosted-supabase-mcp → database, auth, storage

Security by Default:
  - JWT-authenticated tool access
  - Credential masking baked in
  - Audit-ready logging

Instant Feedback:
  - List tables, apply migrations, inspect storage in seconds
  - Reusable TypeScript types on demand
  - Automation via CI-friendly MCP clients
```

---

## 🏢 Alignment with Agiletec Inc. Vision

Agiletec Inc. exists to help organisations escape dependency chains and bring development in-house. This MCP server embodies that philosophy by giving platform engineers direct, scriptable control of their Supabase environments.

### Corporate Mission: 多重請負構造を撲滅する

Traditional cloud tooling keeps teams dependent on hosted dashboards and opaque APIs. In a self-hosted world, accepting those dependencies reintroduces the very outsourcing layers we want to eliminate.

```
Legacy Workflow:
  Developer
    ↓ waits on
  Browser dashboards & manual scripts
    ↓ rely on
  Shared service keys & tribal knowledge
    ↓ cause
  Shadow IT + security exposure
```

We flip that structure:

```
Self-Hosted Supabase MCP Workflow:
  Developer / AI agent
    ↓ interacts via MCP
  Audited, RBAC-controlled tool layer
    ↓ operates
  Self-hosted Supabase services (DB, auth, storage)
    ↓ delivers
  Trusted, automated operations
```

### Corporate Vision: すべての企業に自社開発

To build in-house, teams need infrastructure confidence. Our MCP server delivers:

1. **Operational Clarity**  
   - Real-time insights (`get_database_stats`, `list_realtime_publications`) without leaving the IDE.
2. **Safe Autonomy**  
   - Human-approval guardrails for destructive tools (`apply_migration`, `delete_auth_user`).
   - Credential masking and session control to keep secrets locked down.
3. **Composable Automation**  
   - Works with CI agents, chat-based copilots, or custom workflows.
   - CLI/Docker packaging so teams can deploy in minutes.

Through this project we make self-hosted Supabase not just possible, but efficient and secure—unlocking true in-house development capability.
   - Zero-token startup (<1 second)
   - Docker containerization (no host pollution)
   - Unified configuration (update once, works everywhere)

3. **Dependency hell → Clean isolation**
   - All servers run in Docker containers
   - No `npx`, `uvx`, or global installations
   - Clean machine, consistent environment

**Result**: Developers can focus on creating value, not fighting tools.

### From Tool Optimization to Business Transformation

**Fixing development tools is not just about productivity—it's about enabling self-development.**

```
Inefficient Tools
  → Developers waste time
  → Companies think "development is too complex"
  → Outsourcing becomes the default
  → Dependency on external vendors increases
  → "In-house development capability" disappears

Efficient Tools (AIRIS MCP Gateway)
  → Developers work efficiently
  → Companies see "development is manageable"
  → In-house development becomes feasible
  → Self-sufficiency increases
  → "In-house development capability" grows
```

**AIRIS MCP Gateway is the first step toward reclaiming development power.**

By solving token explosion, configuration hell, and environment pollution, we remove the barriers that make companies think "we can't develop in-house."

---

## 💡 Core Philosophy

### 1. Zero-Token Principle
**"No tool definition should be sent until explicitly requested."**

Traditional MCP: Send everything upfront → Waste
OpenMCP Pattern: Send metadata only → Load details on-demand

### 2. Build Once, Use Everywhere
**"One configuration file should work across all editors and projects."**

No more maintaining separate configs for Cursor, Windsurf, Zed, VS Code.
Master `mcp.json` → Symlink → Universal compatibility.

### 3. Zero Host Pollution
**"Development tools should not pollute the developer's machine."**

All MCP servers run in Docker containers.
No `npx`, `uvx`, or global installations required.
Clean machine, consistent environment.

### 4. Security by Default
**"Secrets should never touch the filesystem."**

Docker secrets integration (encrypted, runtime-only).
No `.env` files → Zero Git leak risk.

---

## 🚀 Strategic Value

### For Individual Developers
- **Speed**: Zero-token startup = instant IDE readiness
- **Simplicity**: One command install = works everywhere
- **Safety**: Docker secrets = no credential leaks

### For Teams
- **Consistency**: Same toolset across all developers
- **Maintainability**: Update once, applies to everyone
- **Onboarding**: New developers productive in minutes

### For Open Source Community
- **MIT License**: Free to use and modify
- **Extensible**: Add custom MCP servers easily
- **Educational**: Reference implementation of OpenMCP pattern

---

## 🎓 Technical Innovation

### OpenMCP Lazy Loading Pattern
We implement the **Schema Partitioning** technique inspired by OpenMCP:

**Traditional MCP** (Full Schema):
```json
{
  "tools": [
    {
      "name": "stripe_create_payment",
      "inputSchema": {
        "properties": {
          "amount": {"type": "number"},
          "metadata": {
            "properties": {
              "shipping": {
                "properties": {
                  "address": {...}  // Deep nesting
                }
              }
            }
          }
        }
      }
    }
  ]
}
```
**Result**: 1000 tokens per tool × 25 tools = 25,000 tokens

**OpenMCP Pattern** (Partitioned Schema):
```json
{
  "tools": [
    {
      "name": "stripe_create_payment",
      "inputSchema": {
        "properties": {
          "amount": {"type": "number"},
          "metadata": {"type": "object"}  // Top-level only
        }
      }
    },
    {
      "name": "expandSchema",
      "description": "Get detailed schema on-demand"
    }
  ]
}
```
**Result**: 50 tokens per tool × 25 tools = 1,250 tokens (**90% reduction**)

When developer needs details:
```
Claude → expandSchema(toolName="stripe_create_payment", path=["metadata", "shipping"])
       → Returns detailed schema only for that property
```

---

## 🌟 Long-Term Vision

### Phase 1: MVP (Current)
**Goal**: Prove 75-90% token reduction is achievable
**Target**: Individual developers adopting Gateway

### Phase 2: Stabilization (2025 Q2)
**Goal**: Production-ready reliability
**Target**: Small teams standardizing on Gateway

### Phase 3: Universal Adoption (2025 Q3)
**Goal**: All major editors supported (Cursor, Windsurf, Zed, VS Code)
**Target**: Recommended by editor vendors

### Phase 4: Ecosystem (2025 Q4)
**Goal**: Gateway becomes MCP server marketplace
**Target**: Community-contributed servers, plugin ecosystem

---

## 🧭 Guiding Principles

1. **User First**: Developer experience over implementation complexity
2. **Simplicity**: One command install, zero configuration
3. **Performance**: Sub-second IDE startup, always
4. **Security**: No secrets on disk, ever
5. **Openness**: MIT license, community-driven development
6. **Quality**: Production-ready code, comprehensive testing
7. **Documentation**: Clear guides for users and contributors

---

## 📐 Success Metrics

### Technical Goals
- ✅ Token reduction: 75-90%
- ✅ Startup time: <1 second
- ✅ Zero host dependencies (Docker-only)
- ✅ Multi-editor support (4+ editors)

### Adoption Goals
- Phase 1: 100 developers (MVP validation)
- Phase 2: 1,000 developers (community traction)
- Phase 3: 10,000 developers (industry standard)

### Community Goals
- 50+ contributors
- 100+ custom MCP servers
- Documentation in 5+ languages

---

## 💬 Why This Matters

**Current MCP architecture is fundamentally inefficient.**

Sending all tool definitions upfront is like loading an entire library into memory before opening a single book. It's wasteful, slow, and doesn't scale.

**We're fixing this at the protocol level.**

OpenMCP Lazy Loading is not a hack—it's how MCP should have worked from the beginning. By proving this pattern works in production, we're establishing a new standard for the entire MCP ecosystem.

**This is bigger than one tool.**

AIRIS MCP Gateway is the reference implementation, but the real mission is changing how developers interact with AI tools. We're building the infrastructure for the next generation of AI-powered development environments.

---

## 🔗 Related Documents

### Corporate Level
- [Agiletec Inc. VISION.md](../agiletec/VISION.md) - Corporate philosophy and mission

### Product Level
- [ROADMAP.md](./ROADMAP.md) - Development phases and timeline
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical design and implementation
- [TASK_LIST.md](./TASK_LIST.md) - Current development status
- [README.md](./README.md) - Installation and usage guide

---

**"Build once. Use everywhere. Zero waste."**

— Agiletec Inc.
