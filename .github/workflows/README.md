# GitHub Actions Workflows

## `ci.yml` — Main CI/CD Pipeline

### Triggers
- Push to `main`/`master`
- Pull requests

### Jobs

| Job | Purpose | Runs On |
|-----|---------|---------|
| `test` | Install deps, lint, Docker build test | PR + Push |
| `security` | Trivy vulnerability scan | After test |
| `build-and-push` | Build & push to GHCR (ghcr.io/YOUR-USER/cv-generator) | Push only |
| `deploy` | Auto-deploy to VPS via SSH | Push to main only |

### Required Secrets for Auto-Deploy
```bash
gh secret set VPS_HOST     --body "123.456.789.0"   # Your VPS IP
gh secret set VPS_USER     --body "root"            # SSH user
gh secret set VPS_SSH_KEY  < ~/.ssh/id_rsa           # SSH private key
```

## `release.yml` — Release on Tag

### Triggers
- Push tag `v*` (e.g. `v1.0.0`)

### Outputs
- GitHub Release with changelog
- Versioned Docker image (`:v1.0.0`, `:latest`)
