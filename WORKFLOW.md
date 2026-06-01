# Rizzly Git Workflow

This repository uses a structured Git workflow to ensure `main` (production) remains stable.

## Branch Structure

- **`main`** → Live production branch. Auto-deploys to `rizzly.vercel.app`. **NEVER commit directly here.**
- **`dev`** → Integration branch. All features merge here first. Auto-deploys to the Vercel preview URL.
- **`feature/*`** → One branch per feature/change (e.g., `feature/coupon-manager`).
- **`fix/*`** → Bug fixes (e.g., `fix/bio-generator-crash`).
- **`experiment/*`** → Risky experiments that may or may not ship.

---

## Workflow Guide

### 1. Starting any new change
Always branch off from the latest `dev`.
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. While working
Commit often. Use the standard commit message format below.
```bash
git add .
git commit -m "feat: description of what you did"
```

### 3. Finished a feature
Push your branch and open a Pull Request (PR) against `dev`.
```bash
git push origin feature/your-feature-name
```
- **Open a Pull Request:** `feature/*` → `dev` (NOT `main`).
- Review it yourself, check the Vercel preview URL (`*-git-dev.vercel.app`).
- Merge to `dev` once it looks good.

### 4. Releasing to production
When `dev` is stable and tested:
- **Open a Pull Request:** `dev` → `main`.
- Merging this PR triggers the production deploy on Vercel automatically.

---

## Commit Message Format

Keep commit messages consistent to make the history readable.

- `feat:` for new features (e.g., `feat: add coupon code manager`)
- `fix:` for bug fixes (e.g., `fix: resolve bio generator timeout`)
- `chore:` for maintenance, refactoring, or tooling (e.g., `chore: refactor file structure`)
- `docs:` for documentation updates (e.g., `docs: update README`)
- `style:` for UI/CSS changes without logic changes (e.g., `style: fix padding on mobile nav`)
