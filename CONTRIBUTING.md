# Contributing to CV Generator

Thanks for your interest in contributing! This guide will help you get started.

## Quick Start

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/cv-generator.git
cd cv-generator
npm install

# Copy environment config
cp .env.example .env

# Run in development mode
npm run dev
```

The app runs on `http://localhost:8083` by default.

## How to Contribute

### Bug Reports

1. Check [existing issues](../../issues) to avoid duplicates
2. Open a [bug report](../../issues/new?template=bug_report.yml) with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser / OS info

### Feature Requests

1. Open a [feature request](../../issues/new?template=feature_request.yml)
2. Describe the problem it solves, not just the solution
3. Include examples or mockups if possible

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/your-feature` or `fix/your-bugfix`
3. **Make changes** — keep PRs focused on one thing
4. **Test locally**: `npm run dev` and verify your change
5. **Commit** with clear messages:
   - `feat: add dark mode template`
   - `fix: prevent duplicate skill entries`
   - `docs: update API examples`
6. **Push** and open a PR against `main`
7. Fill out the PR template completely

### Code Style

- **JavaScript**: ESLint defaults (project config in `package.json`)
- **Templates**: 2-space indent, semantic HTML
- **CSS**: BEM-like naming, mobile-first media queries
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) preferred

## Project Structure

```
cv-generator/
├── src/              # Express server, routes, middleware
├── views/            # EJS page templates
├── public/           # Static assets (CSS, JS, images)
├── templates/        # ATS-optimized CV HTML templates
├── scripts/          # DB init and utility scripts
├── db/               # SQLite database (gitignored)
├── app.py            # Flask API server (Python, alternative)
└── Dockerfile        # Production Docker build
```

## Development Tips

- The Express app uses **SQLite** via `better-sqlite3` — no external DB needed
- AI features use an OpenAI-compatible API (configure in `.env`)
- Templates are plain HTML/CSS — no framework required
- Run `make test` or `npm test` for a quick health-check

## Adding a New CV Template

1. Create `templates/your-template.html` with inline CSS
2. Use these placeholder variables (EJS syntax):
   - `<%= name %>`, `<%= email %>`, `<%= phone %>`, `<%= summary %>`
   - `<% experience.forEach(function(exp) { %>` … `<% }) %>`
   - `<% skills.forEach(function(skill) { %>` … `<% }) %>`
3. Register it in `src/server.js` template list
4. Add a screenshot to `screenshots/` and update README

## Need Help?

- Open a [Discussion](../../discussions) for questions
- Ping maintainers in issues with `@mention`

## License

By contributing, you agree your code will be released under the [MIT License](LICENSE).
