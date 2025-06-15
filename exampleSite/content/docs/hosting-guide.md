---
title: "Hosting Your Hugo Site"
description: "Step-by-step instructions for deploying Hugo sites on popular hosting platforms"
date: 2024-01-15
lastmod: 2024-01-15
toc: true
---

This guide covers how to deploy your Hugo site on various hosting platforms, from static site hosts to cloud providers.

## Prerequisites

- Hugo site ready for deployment
- Git repository (GitHub, GitLab, etc.)
- Basic command line knowledge

## Quick Comparison

| Platform | Cost | Build Time | CDN | Custom Domain | SSL |
|----------|------|------------|-----|---------------|-----|
| Netlify | Free tier | Fast | ✅ | ✅ | ✅ |
| GitHub Pages | Free | Medium | ✅ | ✅ | ✅ |
| Vercel | Free tier | Very Fast | ✅ | ✅ | ✅ |
| GitLab Pages | Free | Medium | ✅ | ✅ | ✅ |
| Firebase | Free tier | Fast | ✅ | ✅ | ✅ |

## Netlify (Recommended)

**Best for**: Beginners, continuous deployment, form handling

### Method 1: Git Integration (Recommended)

1. **Push your Hugo site to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your Git provider and repository

3. **Configure Build Settings**
   ```yaml
   Build command: hugo --minify
   Publish directory: public
   Environment variables:
     HUGO_VERSION: 0.120.0  # Use your Hugo version
   ```

4. **Deploy**
   - Click "Deploy site"
   - Your site will be available at `https://random-name.netlify.app`

### Method 2: Manual Upload

1. **Build your site locally**
   ```bash
   hugo --minify
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com/drop](https://netlify.com/drop)
   - Drag and drop your `public` folder

### Netlify Configuration File

Create `netlify.toml` in your site root:

```toml
[build]
  command = "hugo --minify"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.120.0"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "frame-ancestors https://www.facebook.com"

# Redirect rules
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301
```

**Useful Links:**
- [Netlify Hugo Documentation](https://docs.netlify.com/configure-builds/common-configurations/hugo/)
- [Custom Domain Setup](https://docs.netlify.com/domains-https/custom-domains/)

## GitHub Pages

**Best for**: Free hosting, GitHub integration, simple setup

### Method 1: GitHub Actions (Recommended)

1. **Create workflow file** `.github/workflows/hugo.yml`:

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v3

      - name: Build with Hugo
        env:
          HUGO_ENVIRONMENT: production
          HUGO_ENV: production
        run: |
          hugo \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - Push to trigger deployment

### Method 2: Manual Build

1. **Configure Hugo for GitHub Pages**
   ```yaml
   # config.yaml
   baseURL: 'https://username.github.io/repository-name'
   ```

2. **Build and push to gh-pages branch**
   ```bash
   hugo --minify
   git add public
   git commit -m "Deploy site"
   git subtree push --prefix public origin gh-pages
   ```

**Useful Links:**
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Hugo on GitHub Pages](https://gohugo.io/hosting-and-deployment/hosting-on-github/)

## Vercel

**Best for**: Fast builds, edge functions, developer experience

### Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Or connect via dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel auto-detects Hugo configuration

### Configuration File

Create `vercel.json`:

```json
{
  "build": {
    "env": {
      "HUGO_VERSION": "0.120.0"
    }
  },
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

**Useful Links:**
- [Vercel Hugo Documentation](https://vercel.com/docs/frameworks/hugo)

## GitLab Pages

**Best for**: GitLab users, CI/CD integration

### Setup

Create `.gitlab-ci.yml`:

```yaml
image: klakegg/hugo:ext-alpine

variables:
  GIT_SUBMODULE_STRATEGY: recursive

pages:
  script:
    - hugo --minify
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

**Useful Links:**
- [GitLab Pages Documentation](https://docs.gitlab.com/ee/user/project/pages/)

---

## Firebase Hosting

**Best for**: Google ecosystem, dynamic features

### Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure** `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "public",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/404.html"
         }
       ]
     }
   }
   ```

4. **Build and deploy**
   ```bash
   hugo --minify
   firebase deploy
   ```

**Useful Links:**
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)

---

## Amazon S3 + CloudFront

**Best for**: AWS ecosystem, high traffic sites

### Setup

1. **Build your site**
   ```bash
   hugo --minify
   ```

2. **Create S3 bucket**
   - Enable static website hosting
   - Upload `public` folder contents

3. **Configure CloudFront**
   - Create distribution pointing to S3 bucket
   - Set up custom domain and SSL certificate

4. **Automated deployment with GitHub Actions**
   ```yaml
   - name: Deploy to S3
     run: |
       aws s3 sync ./public s3://your-bucket-name --delete
       aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
   ```

**Useful Links:**
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

## Custom Domain Setup

### General Steps

1. **Configure your DNS**
   - Add CNAME record pointing to hosting provider
   - Or A record for apex domain

2. **Common DNS Records**
   ```
   # Netlify
   CNAME www your-site.netlify.app
   
   # GitHub Pages
   CNAME www username.github.io
   
   # Vercel
   CNAME www your-site.vercel.app
   ```

3. **SSL Certificate**
   - Most platforms provide automatic SSL
   - May take up to 24 hours to provision

---

## Performance Optimization

### Hugo Configuration

```yaml
# config.yaml
minify:
  disableCSS: false
  disableHTML: false
  disableJS: false
  disableJSON: false
  disableSVG: false
  disableXML: false

imaging:
  resampleFilter: "CatmullRom"
  quality: 75
  anchor: "smart"

caches:
  assets:
    dir: ":resourceDir/_gen"
    maxAge: "1h"
  getcsv:
    maxAge: "10s"
  getjson:
    maxAge: "10s"
```

### Build Optimization

```bash
# Production build
hugo --minify --gc --enableGitInfo

# With specific environment
HUGO_ENV=production hugo --minify
```

---

## Troubleshooting

### Common Issues

1. **Build fails with theme submodule**
   ```bash
   git submodule update --init --recursive
   ```

2. **Assets not loading**
   - Check `baseURL` in config
   - Ensure relative URLs are used

3. **404 errors**
   - Verify `publishDir` setting
   - Check routing configuration

4. **Slow build times**
   - Use `--gc` flag
   - Consider build caching
   - Optimize images before processing

### Debug Commands

```bash
# Verbose build output
hugo -v

# Check configuration
hugo config

# Test locally
hugo server -D --disableFastRender
```

---

## Continuous Integration Tips

### Environment Variables

```bash
# Common Hugo environment variables
HUGO_VERSION=0.120.0
HUGO_ENV=production
HUGO_ENABLEGITINFO=true
NODE_ENV=production
```

### Build Scripts

Create `package.json` for Node.js tools:

```json
{
  "scripts": {
    "build": "hugo --minify --gc",
    "dev": "hugo server -D",
    "clean": "rm -rf public resources"
  },
  "devDependencies": {
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

---

## Security Considerations

### Content Security Policy

```html
<!-- In your head.html partial -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### Headers Configuration

Most platforms support custom headers:

```yaml
# Netlify
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## Monitoring and Analytics

### Popular Analytics Solutions

- **Google Analytics 4**: Most comprehensive
- **Plausible**: Privacy-focused alternative
- **Fathom**: Simple, privacy-focused
- **Netlify Analytics**: Server-side analytics

### Performance Monitoring

- **Google PageSpeed Insights**
- **GTmetrix**
- **WebPageTest**
- **Lighthouse CI** for automated testing


This guide covers the most popular hosting options for Hugo sites. Choose based on your specific needs, technical expertise, and budget requirements.
