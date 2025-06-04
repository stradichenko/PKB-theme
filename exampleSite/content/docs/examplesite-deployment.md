+++
title = "Deploying with exampleSite"
date = 2023-07-02T09:00:00-07:00
draft = false
tags = ["deployment", "examplesite", "quickstart", "documentation"]
categories = ["guides", "documentation"]
toc = true
description = "Guide for deploying your site using PKB-theme's exampleSite as a template"
+++

# Deploying with exampleSite

The PKB-theme includes an `exampleSite` directory that serves as both a demo and a template for your own site.

## Quick Start

1. **Copy exampleSite Contents**
   ```bash
   cp -r themes/PKB-theme/exampleSite/* .
   ```

2. **Update Configuration**
   Edit `config.toml`:
   ```toml
   baseURL = "https://your-username.github.io/your-site/"
   title = "Your Site Title"
   theme = "PKB-theme"
   ```

3. **Customize Content**
   - Modify content in `content/` directory
   - Update images in `static/` directory
   - Adjust layouts in `layouts/` if needed

## Directory Structure

The exampleSite provides a complete structure:

```
exampleSite/
├── config.toml      # Site configuration
├── content/         # Your content
│   ├── docs/        # Documentation pages
│   └── posts/       # Blog posts
├── static/          # Static assets
└── layouts/         # Custom layouts (optional)
```

## Configuration Reference

Key settings in `config.toml`:

```toml
[params]
  # Site features
  enableSearch = true
  enableDarkMode = true
  
  # Navigation
  enableBreadcrumb = true
  enableToc = true
  
  # Footer
  showFooter = true
  showCopyright = true
```

## Next Steps

After copying exampleSite:

1. Replace example content with your own
2. Update site metadata and configuration
3. Test locally using `hugo server`
4. Deploy to your hosting platform

For more details on customization, see the [theme configuration guide](/docs/configuration).
