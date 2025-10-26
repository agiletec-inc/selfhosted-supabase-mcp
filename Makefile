# ================================
# MCP Server Development Makefile
# ================================
# Docker-First development for selfhosted-supabase-mcp
# User distribution: npx or Docker
# ================================

.DEFAULT_GOAL := help

# ========== Environment Settings ==========
export COMPOSE_DOCKER_CLI_BUILD := 1
export DOCKER_BUILDKIT := 1

# Auto-detect project name from directory
PROJECT ?= $(notdir $(shell pwd))
export COMPOSE_PROJECT_NAME := $(PROJECT)

# Workspace service name
WORKSPACE_SVC ?= workspace

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

# ========== Help ==========
.PHONY: help
help:
	@echo ""
	@echo "$(BLUE)MCP Server Development Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Project: $(PROJECT)$(NC)"
	@echo ""

# ========== Core Commands ==========

.PHONY: up
up: ## Start development workspace
	@echo "$(GREEN)Starting workspace...$(NC)"
	@docker compose up -d --remove-orphans
	@echo "$(GREEN)✅ Workspace started$(NC)"

.PHONY: down
down: ## Stop workspace
	@echo "$(YELLOW)Stopping workspace...$(NC)"
	@docker compose down --remove-orphans
	@echo "$(GREEN)✅ Stopped$(NC)"

.PHONY: restart
restart: down up ## Restart workspace

.PHONY: logs
logs: ## Show workspace logs
	@docker compose logs -f $(WORKSPACE_SVC)

.PHONY: ps
ps: ## Show container status
	@docker compose ps

# ========== Development Commands ==========

.PHONY: workspace
workspace: ## Enter workspace shell
	@docker compose exec $(WORKSPACE_SVC) sh

.PHONY: install
install: ## Install dependencies (pnpm in Docker)
	@echo "$(BLUE)Installing dependencies in container...$(NC)"
	@docker compose exec $(WORKSPACE_SVC) pnpm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

.PHONY: build
build: ## Build TypeScript code (in Docker)
	@echo "$(BLUE)Building in container...$(NC)"
	@docker compose exec $(WORKSPACE_SVC) pnpm run build
	@echo "$(GREEN)✅ Build complete$(NC)"

.PHONY: dev
dev: ## Start dev watch mode (in Docker)
	@echo "$(BLUE)Starting dev watch mode...$(NC)"
	@docker compose exec $(WORKSPACE_SVC) pnpm run dev

.PHONY: test
test: ## Run tests (in Docker)
	@echo "$(BLUE)Running tests...$(NC)"
	@docker compose exec $(WORKSPACE_SVC) pnpm run test

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)Running type check...$(NC)"
	@docker compose exec $(WORKSPACE_SVC) pnpm exec tsc --noEmit

# ========== Distribution Commands ==========

.PHONY: docker-build
docker-build: ## Build Docker image for distribution
	@echo "$(BLUE)Building Docker image for distribution...$(NC)"
	@docker build -t agiletec/selfhosted-supabase-mcp:latest -f Dockerfile.dist .
	@echo "$(GREEN)✅ Docker image built$(NC)"

.PHONY: docker-run
docker-run: ## Run distribution Docker image
	@docker run --rm -it agiletec/selfhosted-supabase-mcp:latest --help

# ========== Clean Commands ==========

.PHONY: clean
clean: ## Clean Mac host artifacts (Docker-First violation check)
	@echo "$(YELLOW)🧹 Cleaning Mac host artifacts...$(NC)"
	@echo "$(YELLOW)   ⚠️  These files should NOT exist on Mac in Docker-First dev$(NC)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
	@find . -name ".DS_Store" -type f -delete 2>/dev/null || true
	@echo "$(GREEN)✅ Mac host cleaned$(NC)"

.PHONY: clean-all
clean-all: down clean ## Full cleanup including Docker volumes
	@echo "$(YELLOW)⚠️  Removing Docker volumes (destroys data)...$(NC)"
	@docker compose down -v
	@echo "$(GREEN)✅ Full cleanup complete$(NC)"

# ========== Config ==========

.PHONY: config
config: ## Show effective docker compose configuration
	@docker compose config
