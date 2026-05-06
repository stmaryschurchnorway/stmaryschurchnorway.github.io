# Google API Key Setup - Quick Reference

## ✅ What's Done

| Component | Status | Details |
|-----------|--------|---------|
| GitHub Actions | ✓ Done | Workflow reads `GOOGLE_API_KEY` secret automatically |
| Local Config | ✓ Done | `_config.yml` reads from `GOOGLE_API_KEY` env var |
| Local Template | ✓ Done | `.env.local.template` has instructions |
| Dev Script | ✓ Done | `./local-dev.sh` loads env & starts Jekyll |
| Documentation | ✓ Done | `LOCAL_DEVELOPMENT_SETUP.md` complete guide |
| Git Security | ✓ Done | `.env.local` in `.gitignore` (won't leak) |

## 🚀 For GitHub Deployment

**You've already done this!**

1. ✓ Added GOOGLE_API_KEY to GitHub Secrets
2. ✓ Updated `.github/workflows/jekyll.yml` to use it
3. ✓ When you push → GitHub Actions automatically uses the secret
4. ✓ Calendar events work on live site automatically

**No further action needed** - just push and it works!

## 💻 For Local Development

### One-time setup (5 minutes):

```bash
# 1. Create .env.local from template
cp .env.local.template .env.local

# 2. Edit and add your API key
nano .env.local  # or use your editor
```

In `.env.local`:
```
GOOGLE_API_KEY=AIzaSy...  # Paste your actual key here
```

### Every time you develop:

```bash
# Option 1: Easy (recommended)
./local-dev.sh

# Option 2: Manual
export GOOGLE_API_KEY=$(cat .env.local | grep GOOGLE_API_KEY | cut -d= -f2)
bundle exec jekyll serve --livereload
```

Then open: **http://localhost:4000**

## 🔐 Security

✓ Real keys only in `.env.local` (never committed)
✓ Template in `.env.local.template` (safe to commit)
✓ GitHub Secret protected (not in logs)
✓ API key can be restricted to Calendar API only

## 📚 Documentation

- **Setup & Troubleshooting**: `LOCAL_DEVELOPMENT_SETUP.md`
- **Workflow Details**: `.github/workflows/jekyll.yml`
- **Config**: `_config.yml` (reads ENV['GOOGLE_API_KEY'])

## ❓ FAQ

**Q: Do I need to do anything for GitHub?**
A: No! You already added the secret. It's wired up automatically.

**Q: What if I lose my API key?**
A: Generate a new one in Google Cloud Console and update GitHub Secrets.

**Q: Can the local .env.local be different from GitHub's secret?**
A: Yes! You can have different keys or even no key locally if you don't need calendar events.

**Q: Is my API key safe?**
A: Yes - it's in .env.local which is in .gitignore and will never be committed.

---

**Ready to develop?** Run `./local-dev.sh` and start coding!
