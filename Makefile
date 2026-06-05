.PHONY: help install dev build test clean docker-up docker-build docker-down lint db-init

# Default
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────────────

install: ## Install Node.js dependencies
	npm install

dev: ## Start development server with auto-reload
	npm run dev

lint: ## Run ESLint on source files
	npx eslint src/ --ignore-pattern 'node_modules' || true

test: ## Run health-check test (starts server, hits /health)
	npm test

# ── Database ─────────────────────────────────────────

db-init: ## Initialize SQLite database
	npm run db:init

# ── Build ────────────────────────────────────────────

build: ## Build Docker image locally
	docker build -t cv-generator:latest .

# ── Docker ───────────────────────────────────────────

docker-build: ## Build Docker image (alias for build)
	docker build -t cv-generator:latest .

docker-up: ## Start all services with docker-compose
	docker-compose up -d

docker-down: ## Stop all docker-compose services
	docker-compose down

docker-logs: ## Tail docker-compose logs
	docker-compose logs -f

# ── Cleanup ──────────────────────────────────────────

clean: ## Remove node_modules, DB files, and Docker images
	rm -rf node_modules
	rm -f db/*.db db/*.sqlite db/*.sqlite3
	docker rmi cv-generator:latest 2>/dev/null || true
	@echo "✅ Cleaned up"
