+++
title = "GitHub Pages with Hugo"
date = 2023-07-03T09:00:00-07:00
draft = false
tags = ["github-pages", "hugo", "deployment", "documentation"]
categories = ["guides", "documentation"]
toc = true
description = "How to deploy your PKB-theme site to GitHub Pages using Hugo"
+++

# Deploying to GitHub Pages with Hugo

This guide explains how to deploy your PKB-theme site to GitHub Pages using Hugo's built-in capabilities.

## Prerequisites

- Hugo Extended version installed
- Git repository initialized
- GitHub account
- PKB-theme installed as a submodule

## Configuration Steps

1. **Update config.toml**
   ```toml
   baseURL = "https://username.github.io/repository-name/"
   theme = "PKB-theme"
   publishDir = "docs"  # Required for GitHub Pages
   ```

2. **Create GitHub Workflow**
   Create `.github/workflows/hugo.yml`:
   ```yaml
   name: Deploy Hugo site

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
           with:
             submodules: true
             fetch-depth: 0

         - name: Setup Hugo
           uses: peaceiris/actions-hugo@v2
           with:
             hugo-version: 'latest'
             extended: true

         - name: Build
           run: hugo --minify

         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./public
   ```

## Repository Settings

1. Go to repository Settings → Pages
2. Set Source to:
   - Deploy from a branch
   - Branch: gh-pages (created by the workflow)
   - Folder: / (root)

## Local Testing

```bash
# Build site
hugo

# Test locally
hugo server

# Deploy changes
git add .
git commit -m "Update site content"
git push origin main
```

## Troubleshooting

Common issues and solutions:

- **404 Errors**: Verify baseURL in config.toml
- **Missing Theme**: Check submodule initialization
- **Build Failures**: Review GitHub Actions logs
- **CSS Not Loading**: Ensure Hugo Extended is used

## Next Steps

After deployment is complete:
- Enable custom domain (optional)
- Set up SSL certificate
- Configure cache settings

For more details on GitHub Actions deployment, see the [Hugo documentation](https://gohugo.io/hosting-and-deployment/hosting-on-github/).
