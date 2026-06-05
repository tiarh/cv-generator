"""
CV Generator v2 — Flask API Server
Live preview + PDF export, ATS-friendly template + AI content assist
Uses OpenClaw's configured providers (no extra API keys needed)
"""
import io, os, logging
from flask import Flask, render_template, request, jsonify, send_file

try:
    import openai
    HAS_OPENAI = True
    openai.api_key = os.getenv("OPENAI_API_KEY", "REDACTED")
    openai.base_url = os.getenv("OPENAI_BASE_URL", "https://api.generalcompute.com/v1/")
    logging.info(f"[AI] OpenAI client ready -- base: {openai.base_url}")
except Exception as e:
    HAS_OPENAI = False
    logging.warning(f"[AI] OpenAI client failed: {e}")

from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder="templates")
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-change-me")
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024

# AI Content Generation
AI_PROMPTS = {
    "summary": (
        "Kamu adalah penulis CV profesional berbahasa Indonesia. "
        "Tulis ringkasan profesional 3-4 kalimat untuk CV. "
        "Gunakan kata kerja aktif, cantumkan hasil konkret jika memungkinkan. "
        "Bahasa Indonesia formal. Langsung tulis ringkasannya saja, tanpa label.\n\n"
        "Nama: {name}\nPosisi/Jabatan: {title}\nKeahlian: {skills}\nPengalaman: {experience}"
    ),
    "experience": (
        "Tulis 3 pencapaian kerja di CV untuk posisi {title} di {company}. "
        "Format: 1 baris = 1 poin. Mulai dengan kata kerja (Meningkatkan, Mengelola, Menyelesaikan, Mengurangi). "
        "Sertakan angka: % , jam, rupiah. Bahasa Indonesia. "
        "Hanya 3 baris. Tidak ada penjelasan. Tidak ada bullet symbol. Tidak ada nomer. "
        "Contoh:\n"
        "Meningkatkan uptime jaringan dari 95% jadi 99.5% dalam 6 bulan\n"
        "Menyelesaikan 120 instalasi per bulan dengan rata-rata 2.5 jam per unit\n"
        "Mengurangi waktu perbaikan dari 4 jam jadi 30 menit"
    ),
    "skills": (
        "Kamu adalah penulis CV profesional berbahasa Indonesia. "
        "Sarankan SATU kategori keahlian dengan 6-8 skill spesifik yang relevan. "
        "Format output exact:\n"
        "NamaKategori: skill1, skill2, skill3, skill4, skill5, skill6\n"
        "Tidak ada penjelasan lain. Bahasa Indonesia untuk nama kategori.\n\n"
        "Posisi/Jabatan: {title}"
    ),
}


def generate_with_model(prompt, model="deepseek-ai/DeepSeek-V4-Flash", max_tokens=1024):
    if not HAS_OPENAI:
        return None
    try:
        resp = openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"[AI] Generation error ({model}): {e}")
        return None


def generate_content(prompt_type, **kwargs):
    prompt = AI_PROMPTS.get(prompt_type, "").format(**kwargs)
    if not prompt:
        return None
    # Cascade: DeepSeek V4 Flash (best quality) -> MiniMax M2.7
    models = [
        "deepseek-ai/DeepSeek-V4-Flash",
        "minimax-m2.7",
        "MiniMax-M2.7",
    ]
    for model in models:
        result = generate_with_model(prompt, model=model)
        if result:
            logger.info(f"[AI] {prompt_type} generated with {model} ({len(result)} chars)")
            return result
    logger.warning(f"[AI] All models failed for {prompt_type}")
    return None


# Routes
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/preview", methods=["POST"])
def api_preview():
    data = request.get_json() or {}
    html = render_template("cv_template.html", data=data, preview=True)
    return jsonify({"html": html})


@app.route("/api/export-pdf", methods=["POST"])
def api_export_pdf():
    data = request.get_json() or {}
    html = render_template("cv_template.html", data=data, preview=False)
    font_config = FontConfiguration()
    pdf_buffer = HTML(string=html, base_url=request.url_root).write_pdf(
        font_config=font_config, presentational_hints=True
    )
    buf = io.BytesIO(pdf_buffer)
    name = data.get("name", "resume").replace(" ", "_")
    return send_file(
        buf, mimetype="application/pdf",
        as_attachment=True, download_name=f"CV_{name}.pdf"
    )


@app.route("/api/ai-generate", methods=["POST"])
def api_ai_generate():
    data = request.get_json() or {}
    action = data.get("action")
    ctx = data.get("context", {})
    result = generate_content(action, **ctx)
    if result:
        return jsonify({"success": True, "content": result})
    return jsonify({"success": False, "content": None, "error": "AI generation failed -- no working model"}), 200


@app.route("/api/ai-status", methods=["GET"])
def api_ai_status():
    return jsonify({
        "available": HAS_OPENAI,
        "provider": openai.base_url if HAS_OPENAI else None,
        "models": ["deepseek-ai/DeepSeek-V4-Flash", "minimax-m2.7", "MiniMax-M2.7"]
    })


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting CV Generator on {host}:{port}")
    app.run(host=host, port=port, debug=False, threaded=True)