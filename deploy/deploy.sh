#!/bin/bash
# ── CV Generator v2 — Deploy Script ──────────────────────────────────
set -e
cd /root/superagent-v3/cv-generator

echo "→ Installing Python venv + dependencies..."
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

echo "→ Installing system deps for WeasyPrint (Pango/GDK)..."
apt-get update -qq && apt-get install -y -qq \
  python3-pango python3-gi gir1.2-pangocairo-1.0 \
  libgail30 libgda-5.0-1 libgda-5.0-dev \
  libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 \
  libxml2-dev libxslt-dev libcairo2-dev libffi-dev shared-mime-info \
  2>/dev/null | tail -2

echo "→ Installing systemd service..."
cp deploy/cv-generator.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cv-generator
systemctl restart cv-generator

echo "→ Setting up nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/cv-generator
ln -sf /etc/nginx/sites-available/cv-generator /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "✅ CV Generator deployed!"
echo "   Service:  systemctl status cv-generator"
echo "   Logs:     journalctl -u cv-generator -f"
echo "   URL:      http://cv.tiarh.com  (configure DNS A record first)"
echo ""
echo "→ Next: Point DNS A record cv.tiarh.com → $(curl -s ifconfig.me)"