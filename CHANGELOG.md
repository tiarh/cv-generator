# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-05

### Added

- **Express + EJS app** (`src/server.js`) with SQLite persistence, wizard UI, and draft management
- **AI Content Generator** — professional summary, experience bullets, and skills suggestions powered by OpenAI-compatible API
- **3 ATS-optimized templates** — Classic, Modern, Minimal (clean HTML/CSS, no frameworks)
- **Rate limiting** via `express-rate-limit` on API endpoints
- **Docker support** — multi-stage `Dockerfile` with Chromium/Puppeteer for PDF export
- **docker-compose.yml** with health checks and persistent DB volume
- **Systemd deployment** script and Nginx reverse-proxy config
- **PDF export** with Puppeteer (Node) and WeasyPrint (Python/Flask)
- **Live preview** — see your CV rendered in real-time as you fill in data
- **Draft system** — save, resume, and manage multiple CV drafts
- **`.env.example`** with all configurable options documented

### Changed

- Replaced single-template architecture with multi-template system
- Migrated from in-memory storage to SQLite (`better-sqlite3`)
- Improved form UX with step-by-step wizard flow

---

## [1.0.0] - 2025-01-15

### Added

- Initial release — Flask-based CV generator
- Single ATS-friendly HTML template with PDF export via WeasyPrint
- Basic form input → PDF download workflow
- OpenAI-compatible AI content assist (summary generation)
- Environment-based configuration (`.env`)
- `requirements.txt` for Python dependencies

[2.0.0]: https://github.com/YOUR_USERNAME/cv-generator/releases/tag/v2.0.0
[1.0.0]: https://github.com/YOUR_USERNAME/cv-generator/releases/tag/v1.0.0
