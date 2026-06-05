<div align="center">

# 🎯 CVForge

### *AI-Powered CV Generator — Build ATS-Killer Resumes in Minutes*

```
 ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
╚██████╗   ██║   ██████╔╝███████╗██║  ██║
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
```

[![GitHub stars](https://img.shields.io/github/stars/tiarh/cv-generator?style=social)](https://github.com/tiarh/cv-generator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/tiarh/cv-generator?style=social)](https://github.com/tiarh/cv-generator/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Last Commit](https://img.shields.io/github/last-commit/tiarh/cv-generator)](https://github.com/tiarh/cv-generator/commits/main)

**🇬🇧 Works globally · 🇮🇩 Cocok buat CV Bahasa Indonesia & Inggris · 🌍 International-ready**

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [📸 Screenshots](#-screenshots) · [📘 API](#-api-reference) · [🗺️ Roadmap](#-roadmap) · [🤝 Contributing](#-contributing)

</div>

---

## ✨ Features

- 🤖 **AI Content Engine** — Generate professional summaries, experience bullets, and skill suggestions. Built-in API key — no setup required.
- 📄 **Pixel-Perfect PDF** — Server-side WeasyPrint rendering. ATS-friendly, no broken layouts.
- 🎨 **3 ATS-Optimized Templates** — Modern, Classic, Minimal. Tested against major ATS parsers.
- 👁️ **Live Preview** — See changes in real-time as you edit.
- 💾 **Auto-Save Drafts** — SQLite-backed. Never lose your work.
- 🧙 **Step-by-Step Wizard** — Guided flow from personal info to final export.
- 🌙 **Dark Mode** — Easy on the eyes, always.
- 🐳 **Docker-Ready** — One command to spin up the entire stack.
- 🔒 **Rate Limited** — Protected API endpoints out of the box.
- 🇮🇩🇬🇧 **Bilingual** — Full support for Indonesian and English CVs.

---

## 🚀 Quick Start

### Linux (one-liner)
```bash
git clone https://github.com/tiarh/cv-generator.git && cd cv-generator && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python app.py
```

### macOS (one-liner)
```bash
git clone https://github.com/tiarh/cv-generator.git && cd cv-generator && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python app.py
```

### Windows PowerShell (one-liner)
```powershell
git clone https://github.com/tiarh/cv-generator.git; cd cv-generator; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; python app.py
```

### Docker (one-liner)
```bash
docker compose up -d
```

### RunPod
```bash
docker run -d -p 5000:5000 -p 3000:3000 ghcr.io/tiarh/cv-generator:latest
```

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/cvforge)

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tiarh/cv-generator)

### Koyeb
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=docker&image=ghcr.io/tiarh/cv-generator:latest)

### Fly.io
```bash
fly launch --image ghcr.io/tiarh/cv-generator:latest && fly deploy
```

### Vercel
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify-cli deploy --prod --dir=dist
```

### Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name=cv-generator
```

### Quick Demo Tunnel (localtunnel / ngrok)
```bash
# localtunnel
npx localtunnel --port 5000
# or ngrok
ngrok http 5000
```

### GitHub Pages (static export)
```bash
pip install ghp && ghp-import -n dist && git push origin gh-pages
```

---

## 📸 Screenshots

| Wizard Step | Live Preview | Dark Mode | PDF Export |
|:-----------:|:------------:|:---------:|:----------:|
| ![](docs/screenshots/wizard.png) | ![](docs/screenshots/preview.png) | ![](docs/screenshots/dark-mode.png) | ![](docs/screenshots/pdf-export.png) |

| Modern Template | Classic Template | Minimal Template |
|:--------------:|:----------------:|:----------------:|
| ![](docs/screenshots/template-modern.png) | ![](docs/screenshots/template-classic.png) | ![](docs/screenshots/template-minimal.png) |

---

## 🆚 Why CVForge Over X?

| Feature | CVForge | Canva | Resume.io | Overleaf | Word |
|---------|:-------:|:-----:|:---------:|:--------:|:----:|
| **AI Content Generation** | ✅ Built-in | ❌ | 🔒 Paid | ❌ | ❌ |
| **ATS-Optimized Output** | ✅ Tested | ⚠️ Hit/miss | ✅ | ⚠️ Manual | ❌ |
| **PDF Export** | ✅ Free | 🔒 Watermark | 🔒 1 free | ✅ | ⚠️ Layout shifts |
| **Self-Hosted** | ✅ Full control | ❌ | ❌ | ❌ | ❌ |
| **No Account Required** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Live Preview** | ✅ Real-time | ✅ | ✅ | ✅ | ❌ |
| **Dark Mode** | ✅ | ❌ | ❌ | ❌ | ⚠️ Limited |
| **Auto-Save** | ✅ Local | ☁️ Cloud | ☁️ Cloud | ☁️ Cloud | ✅ |
| **Unlimited Exports** | ✅ | 🔒 | 🔒 | ✅ | ✅ |
| **Privacy-First** | ✅ Your server | ❌ | ❌ | ⚠️ | ⚠️ |
| **Bilingual (ID/EN)** | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Open Source** | ✅ MIT | ❌ | ❌ | ✅ | ❌ |
| **Cost** | **Free forever** | $13/mo | $25/mo | Free | $10/mo |

---

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_PORT` | `5000` | Flask backend port |
| `NODE_PORT` | `3000` | Express/EJS frontend port |
| `AI_API_KEY` | *(built-in)* | OpenAI-compatible API key (pre-configured) |
| `AI_API_BASE` | `https://api.openai.com/v1` | AI API base URL |
| `AI_MODEL` | `gpt-4o-mini` | Model for content generation |
| `DB_PATH` | `data/drafts.db` | SQLite database path |
| `RATE_LIMIT` | `30/minute` | API rate limit per IP |
| `THEME` | `auto` | Default UI theme (`light` / `dark` / `auto`) |

Create a `.env` file from the template:
```bash
cp .env.example .env
```

---

## 📘 API Reference

### Generate AI Content
```bash
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"section":"summary","context":"Software engineer with 5 years in fintech"}'
```

### Preview CV
```bash
curl -X POST http://localhost:5000/api/preview \
  -H "Content-Type: application/json" \
  -d @cv-data.json
```

### Export PDF
```bash
curl -X POST http://localhost:5000/api/export/pdf \
  -H "Content-Type: application/json" \
  -d @cv-data.json \
  --output my-cv.pdf
```

### Save Draft
```bash
curl -X POST http://localhost:5000/api/drafts \
  -H "Content-Type: application/json" \
  -d '{"name":"My Draft","data":{...}}'
```

### List Drafts
```bash
curl http://localhost:5000/api/drafts
```

---

## 🗺️ Roadmap

| Status | Feature |
|:------:|---------|
| 🔜 | **ATS Score Checker** — Real-time ATS compatibility scoring |
| 🔜 | **Multi-Language** — 🇮🇩🇬🇧🇯🇵🇰🇷🇩🇪🇫🇷 Full i18n support |
| 🔜 | **LinkedIn Import** — One-click import from LinkedIn profile |
| 🔜 | **PWA** — Install as app, work offline |
| 🔜 | **CLI Tool** — `cvforge build --template modern` from terminal |
| 🔜 | **Template Marketplace** — Community-designed templates |
| 🔜 | **AI Rewriter** — Rephrase existing CV sections with AI |
| 🔜 | **Signed CVs** — Cryptographically signed PDFs for verification |
| 🔜 | **JSON Resume Schema** — Full [JSON Resume](https://jsonresume.org/) compatibility |
| 🔜 | **Cover Letter Generator** — AI-powered, matched to your CV |

---

## 🏗️ Architecture

```
cv-generator/
├── app.py                  # Flask backend (API, AI, PDF)
├── src/server.js           # Express/EJS frontend (wizard, preview)
├── templates/              # EJS views
├── static/                 # CSS, JS, assets
├── cv_templates/           # 3 ATS HTML/CSS templates
├── data/                   # SQLite auto-save DB
├── docker-compose.yml      # Full-stack Docker
├── deploy/                 # systemd + nginx scripts
└── requirements.txt        # Python deps
```

---

## 🤝 Contributing

We love contributions! See [**CONTRIBUTING.md**](CONTRIBUTING.md) for guidelines.

```bash
# Quick dev setup
git clone https://github.com/tiarh/cv-generator.git
cd cv-generator && pip install -r requirements.txt
npm install && python app.py & npm start
```

---

## 📄 License

This project is licensed under the **MIT License** — use it however you want. See [LICENSE](LICENSE).

---

<div align="center">

## ⭐ Support This Project

If CVForge saved you time, consider giving it a star!

[![Star on GitHub](https://img.shields.io/github/stars/tiarh/cv-generator?style=social&label=Star%20this%20repo%20if%20it%20helped%20you!)](https://github.com/tiarh/cv-generator/stargazers)

**Built with ❤️ by [tiarh](https://github.com/tiarh)**

*Stop paying for resume builders. Start forging your future.* 🔥

</div>
