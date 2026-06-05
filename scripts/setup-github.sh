#!/bin/bash
# Setup GitHub repo and push cv-generator
# Usage: ./scripts/setup-github.sh

set -e

echo "🚀 CV Generator - GitHub Setup"
echo "================================"

# Check gh CLI
if ! command -v gh &> /dev/null; then
    echo "Installing GitHub CLI..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    apt update && apt install gh -y
fi

# Check auth
if ! gh auth status >/dev/null 2>&1; then
    echo "🔑 Login to GitHub..."
    gh auth login
fi

# Create repo
echo "📁 Creating GitHub repo 'cv-generator'..."
gh repo create cv-generator --public --description "ATS-Friendly CV Generator with AI-powered descriptions" --source=. --push

echo "✅ Done! Repo pushed to GitHub"
echo "🔗 URL: https://github.com/$(gh api user -q .login)/cv-generator"

# Setup secrets for CI/CD (optional)
echo ""
echo "🔐 Add CI/CD secrets:"
echo "   VPS_HOST     - Your VPS IP/domain"
echo "   VPS_USER     - SSH username (usually root)"
echo "   VPS_SSH_KEY  - SSH private key for deployment"
echo ""
echo "Add with: gh secret set VPS_HOST -b\"your-vps-ip\""
echo "         gh secret set VPS_USER -b\"root\""
echo "         gh secret set VPS_SSH_KEY < ~/.ssh/id_rsa"
