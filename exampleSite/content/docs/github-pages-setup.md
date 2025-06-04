+++
title = "Setting up GitHub Pages"
date = 2023-07-01T09:00:00-07:00
draft = false
tags = ["github-pages", "setup", "documentation"]
categories = ["guides", "documentation"] 
toc = true
description = "A comprehensive guide to set up GitHub Pages with PKB-theme"
+++

# Setting up GitHub Pages with PKB-theme

This guide explains how to set up GitHub Pages for your PKB-theme repository.

## Important Files

- `_config.yml` - Main Jekyll configuration file
- `Gemfile` - Ruby dependencies for GitHub Pages
- `index.md` - Your homepage content
- `_layouts/` - Theme layout files
- `assets/` - Static files like CSS, images, etc.

## Setup Steps

1. **Configure _config.yml**
   - Ensure your `_config.yml` has the correct theme settings:
   ```yaml
   remote_theme: username/PKB-theme
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select:
     - Branch: `main` (or your preferred branch)
     - Folder: `/ (root)`
   - Click "Save"

3. **Verify Gemfile**
   - Make sure your Gemfile includes:
   ```ruby
   source 'https://rubygems.org'
   gem 'github-pages'
   ```

4. **Create Index Page**
   - Ensure you have an `index.md` in your root directory
   - Add front matter to specify layout:
   ```yaml
   ---
   layout: home
   ---
   ```

## Testing Locally

1. Install dependencies:
   ```bash
   bundle install
   ```

2. Run Jekyll locally:
   ```bash
   bundle exec jekyll serve
   ```

3. Visit `http://localhost:4000` to preview your site

## Troubleshooting

- If pages aren't building, check your repository's Actions tab
- Verify your branch and publishing source settings
- Make sure all required files are committed
- Check GitHub Pages build logs for errors

## Next Steps

After setup, your site will be available at `https://username.github.io/PKB-theme/`. You can now:

- Customize your theme
- Add content to your site
- Configure additional settings in `_config.yml`

For more details on GitHub Pages, visit the [official documentation](https://docs.github.com/en/pages).
