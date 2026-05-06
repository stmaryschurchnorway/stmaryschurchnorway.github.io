# Local Development Setup Guide

## Overview

This guide explains how to set up the church website for local development with Google Calendar API support.

## Prerequisites

- Ruby 3.2+ (check with `ruby --version`)
- Bundler (check with `bundle --version`)
- Git

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd /Users/t888651/repos-telenor/church
bundle install
```

### 2. Get Google API Key

Visit [Google Cloud Console](https://console.cloud.google.com/):

1. Create a new project or select existing one
2. Enable **Google Calendar API**
3. Create an API key credential:
   - Go to **Credentials** → **Create Credentials** → **API Key**
   - Copy the key value
   - (Optional) Restrict key to Calendar API only for security

### 3. Set Up Local Environment

```bash
# Copy the template
cp .env.local.template .env.local

# Edit and add your API key
nano .env.local  # or use your preferred editor
```

Example `.env.local`:
```
GOOGLE_API_KEY=AIzaSy... (your actual key here)
```

### 4. Start Development Server

**Option A: Using the convenience script (RECOMMENDED)**
```bash
./local-dev.sh
```

**Option B: Manual setup**
```bash
export GOOGLE_API_KEY=$(cat .env.local | grep GOOGLE_API_KEY | cut -d= -f2)
bundle exec jekyll serve --livereload
```

Then open: **http://localhost:4000**

## Features

The development server includes:
- ✅ **Live reload** - auto-refresh on file changes
- ✅ **Google Calendar API** - upcoming events display
- ✅ **Draft posts** - view drafts with `--drafts` flag
- ✅ **Future posts** - view scheduled posts with `--future` flag

## File Structure

```
.env.local                    # Your local API key (NEVER commit this)
.env.local.template           # Template with instructions (safe to commit)
_config.yml                   # Reads GOOGLE_API_KEY from environment
local-dev.sh                  # Convenience script to start development
```

## Environment Variables

### For Local Development

Set `GOOGLE_API_KEY` in `.env.local`:
```bash
export GOOGLE_API_KEY=your_key_here
bundle exec jekyll serve
```

### For GitHub Pages (CI/CD)

API key is automatically passed from GitHub Secrets → `.github/workflows/jekyll.yml`:
```yaml
env:
  GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

Users don't need to set anything manually for GitHub deployments.

## Troubleshooting

### Issue: "GOOGLE_API_KEY not configured"
**Solution:** Verify `.env.local` exists and has the key:
```bash
cat .env.local
```

### Issue: "Bundle install fails"
**Solution:** Update Ruby and Bundler:
```bash
ruby -v  # Should be 3.2+
gem install bundler
bundle update
```

### Issue: "Port 4000 already in use"
**Solution:** Use a different port:
```bash
PORT=4001 ./local-dev.sh
```

### Issue: "Calendar events not showing"
**Solution:** Verify API key is valid:
1. Check `.env.local` has the correct key
2. Verify key is enabled in Google Cloud Console
3. Check browser console (F12) for errors

## Commands

### Start with defaults
```bash
./local-dev.sh
```

### Start with custom port
```bash
PORT=4001 ./local-dev.sh
```

### Start with drafts (preview draft posts)
```bash
export GOOGLE_API_KEY=$(cat .env.local | grep GOOGLE_API_KEY | cut -d= -f2)
bundle exec jekyll serve --drafts --livereload --port 4000
```

### Build for production
```bash
export GOOGLE_API_KEY=$(cat .env.local | grep GOOGLE_API_KEY | cut -d= -f2)
bundle exec jekyll build
```

### Build without API key (for testing)
```bash
bundle exec jekyll build  # GOOGLE_API_KEY will be empty
```

## Security Checklist

✅ `.env.local` is in `.gitignore` - won't be committed
✅ `.env.local.template` is safe to commit - shows structure only
✅ API key is restricted to Calendar API in Google Cloud
✅ GitHub Secret is protected - not exposed in logs
✅ Never paste real API keys in issues/discussions

## GitHub Actions Integration

When you push to `main`, GitHub Actions automatically:

1. ✅ Reads `GOOGLE_API_KEY` from GitHub Secrets
2. ✅ Passes it to Jekyll build
3. ✅ Builds and deploys to GitHub Pages
4. ✅ Calendar events work on the live site

**No manual setup needed for GitHub Pages!**

## Development Workflow

```
1. Clone repo
   git clone https://github.com/user/church.git
   cd church

2. Install dependencies
   bundle install

3. Set up local environment
   cp .env.local.template .env.local
   # Edit .env.local with your API key

4. Start development
   ./local-dev.sh
   # Edit files, changes reload automatically

5. Commit changes
   git add .
   git commit -m "feat: add new content"
   git push origin main

6. GitHub Actions deploys automatically
   # Check Actions tab to monitor deployment
```

## Testing Calendar Integration

Once the site is running:

1. Visit **http://localhost:4000/events/**
2. Should see upcoming events from church calendar
3. Check browser console (F12) for any API errors

## Questions?

1. **How do I get the API key?** → See "Get Google API Key" section above
2. **Is my key safe?** → Yes, `.env.local` is in `.gitignore`
3. **Can I use the same key on multiple devices?** → Yes, but keep it secret
4. **What if I forget the key?** → You can generate a new one in Google Cloud Console

## References

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Deployment](https://pages.github.com/)

## Next Steps

1. ✅ Copy `.env.local.template` → `.env.local`
2. ✅ Add GOOGLE_API_KEY to `.env.local`
3. ✅ Run `./local-dev.sh`
4. ✅ Open http://localhost:4000
5. ✅ Start developing!

---

**Happy developing! 🚀**
