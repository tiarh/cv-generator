# CV Generator 📝

ATS-Friendly Resume Generator dengan AI-Powered Description. Buat CV profesional yang lolos parsing ATS dengan mudah.

## ✨ Features

- **3 Template ATS-Optimized**: Modern, Classic, Minimal — semua dirancang untuk lolos Applicant Tracking Systems
- **AI Auto-Generate**: ✨ Generate deskripsi pengalaman kerja dan professional summary otomatis
- **Form Wizard Multi-Step**: Isi data dengan mudah step-by-step
- **PDF Export**: Download CV langsung format PDF
- **Draft Save**: Simpan progress dan lanjutkan nanti
- **Template Fallback**: Kalau AI API key belum di-set, tetap ada kata-kata profesional pre-written

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone dan masuk ke folder
cd cv-generator

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. (Optional) Edit .env untuk AI features
# OPENROUTER_API_KEY=your_key_here

# 5. Jalankan
npm start

# App akan jalan di http://localhost:8083
```

### Docker

```bash
# Build dan jalankan dengan docker-compose
docker-compose up -d

# Cek status
docker-compose ps

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

Docker expose port **8083**.

## 🔧 Setup AI Generate

1. Daftar di [OpenRouter](https://openrouter.ai/)
2. Generate API key
3. Tambahkan ke `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   AI_MODEL=google/gemma-3-27b-it
   ```

Kalau belum punya API key, app tetap jalan pakai **template fallback** dengan kata-kata profesional pre-written.

## 📁 Project Structure

```
cv-generator/
├── src/
│   ├── server.js              # Entry point
│   ├── routes/
│   │   └── cv.js              # All routes
│   └── services/
│       ├── ai.js              # AI generation + fallback templates
│       └── database.js        # SQLite operations
├── views/                     # EJS templates
│   ├── index.ejs              # Landing page (template selector)
│   ├── layout.ejs             # Base layout
│   ├── wizard.ejs             # Form wizard
│   ├── drafts.ejs             # List saved drafts
│   └── templates/             # CV render templates
│       ├── ats-modern.ejs
│       ├── ats-classic.ejs
│       └── ats-minimal.ejs
├── public/                    # Static assets (CSS, JS, images)
├── db/                        # SQLite database
├── scripts/
│   └── init-db.js             # Database init script
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🎨 Template Options

| Template | Style | Best For |
|----------|-------|----------|
| **ATS-Modern** | Clean, single-column, accent colors | Tech, creative roles |
| **ATS-Classic** | Two-column, serif fonts | Corporate, traditional industries |
| **ATS-Minimal** | Ultra-clean, max whitespace | Any role — safest ATS pass |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Landing page |
| GET | `/wizard/:template` | Form wizard |
| GET | `/draft/:id` | Load draft |
| GET | `/drafts` | List all drafts |
| POST | `/api/draft` | Save new draft |
| PUT | `/api/draft/:id` | Update draft |
| DELETE | `/api/draft/:id` | Delete draft |
| POST | `/api/generate/experience` | AI generate experience description |
| POST | `/api/generate/summary` | AI generate professional summary |
| POST | `/preview` | Preview CV HTML |
| POST | `/download` | Download CV as PDF |
| GET | `/health` | Health check |

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Template Engine**: EJS
- **Database**: SQLite (better-sqlite3)
- **Styling**: TailwindCSS CDN
- **AI**: OpenRouter API (Gemma/Claude) with smart fallback
- **PDF**: Puppeteer
- **Container**: Docker + Docker Compose

## 📄 License

MIT License
