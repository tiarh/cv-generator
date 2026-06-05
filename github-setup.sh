#!/usr/bin/env bash
# GitHub Setup Script for cv-generator
# Run this after authenticating with `gh auth login`
set -e

REPO="tiarh/cv-generator"
DESC="🚀 AI-Powered ATS-Friendly CV/Resume Generator — Create professional resumes in minutes. Free, open source, no signup required."

echo "🔍 Checking gh auth status..."
gh auth status

echo ""
echo "📦 Creating GitHub repo: $REPO (public)..."
gh repo create "$REPO" --public --description "$DESC"

echo ""
echo "🚀 Pushing code to origin/master..."
git push -u origin master

echo ""
echo "✅ Done! Repo URL: https://github.com/$REPO"
