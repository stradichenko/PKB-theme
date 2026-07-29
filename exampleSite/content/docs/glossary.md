---
title: "Glossary"
description: "Short definitions of the technical terms that recur across the documentation notes."
date: 2026-07-28T12:00:00-05:00
lastmod: 2026-07-28T12:00:00-05:00
draft: false
tags: ["PKB", "glossary", "terminology"]
categories: ["documentation"]
slug: "glossary"
toc: false
---

# Glossary

Terms are listed alphabetically. Each entry gives a short definition followed by links to the notes that cover the term in depth; the glossary disambiguates, the notes explain.

**Archetype**: the template Hugo uses to seed a new content file created with `hugo new`. See [Creating Posts with Hugo](creating-posts.md).

**Chroma**: the syntax highlighter built into Hugo; the theme drives it class-based with generated dark/light style pairs that follow the color-scheme toggle. See [How the Hugo System Works](hugo-system-architecture.md#feature-subsystems), [SOTA: Hugo](SOTA_hugo.md#findings).

**exampleSite**: the complete demo site bundled with the theme, usable directly as a deployment template. See [Deploying with exampleSite](examplesite-deployment.md).

**Front matter**: the metadata block at the top of a content file (YAML, TOML, or JSON) controlling title, date, taxonomies, and page behavior. See [Creating Posts with Hugo](creating-posts.md), [SOTA: Hugo](SOTA_hugo.md#findings).

**GitHub Pages**: GitHub's free static-site hosting, paired with Hugo through an Actions build pipeline. See [Setting up GitHub Pages](github-pages-setup.md), [GitHub Pages with Hugo](github-pages-hugo.md).

**Goldmark**: the CommonMark-compliant Markdown parser Hugo uses; its extensions (footnote, passthrough) and its render hooks drive the theme's math and link behavior. See [SOTA: Hugo](SOTA_hugo.md#findings).

**Hugo**: the Go-based static site generator this theme is built for. See [SOTA: Hugo](SOTA_hugo.md), [Creating Posts with Hugo](creating-posts.md).

**Hugo Modules**: the Go-module-based dependency system for themes, content mounts, and components; the advanced alternative to installing a theme as a git submodule. See [SOTA: Hugo](SOTA_hugo.md#findings).

**KaTeX**: the fast math-typesetting library Hugo targets for server-side mathematics via the **Passthrough** pipeline. See [SOTA: Hugo](SOTA_hugo.md#findings).

**Matomo**: a full-featured self-hosted web analytics platform. See [Matomo Analytics Setup Guide](matomo-analytics-setup.md), [Self-Hosted Analytics for PKB-theme](analytics-setup.md).

**OpenCart**: a PHP-based self-hosted store platform. See [OpenCart Integration Guide](opencart-setup-guide.md), [Self-Hosted Ecommerce Solutions](ecommerce-solutions.md).

**Passthrough**: a **Goldmark** extension that lifts raw snippets (typically math delimiters such as `$$...$$`) out of the Markdown stream so a **Render hook** can process them. See [SOTA: Hugo](SOTA_hugo.md#findings).

**Plausible**: a lightweight, privacy-friendly self-hosted analytics service. See [Self-Hosted Analytics for PKB-theme](analytics-setup.md), [Analytics Configuration](analytics-configuration.md).

**PrestaShop**: a full-featured PHP self-hosted ecommerce platform. See [PrestaShop Integration Guide](prestashop-setup-guide.md), [Self-Hosted Ecommerce Solutions](ecommerce-solutions.md).

**Render hook**: a Hugo template that overrides how a Markdown element (link, image, heading, code block, passthrough snippet) is rendered to HTML. See [SOTA: Hugo](SOTA_hugo.md#findings).

**Reverse proxy**: a fronting web server that forwards requests to a backend service, used here to serve analytics first-party under your own domain. See [Reverse Proxy Configuration for Analytics](reverse-proxy-setup.md).

**Saleor**: a GraphQL-first, headless self-hosted commerce platform. See [Saleor Integration Guide](saleor-setup-guide.md), [Self-Hosted Ecommerce Solutions](ecommerce-solutions.md).

**Self-hosting**: running services (the site itself, analytics, stores) on your own infrastructure instead of third-party SaaS. See [Hosting Your Hugo Site](hosting-guide.md), [Self-Hosted Ecommerce Solutions](ecommerce-solutions.md).

**SEO**: search engine optimization; the theme implements meta tags, Open Graph, Twitter Cards, JSON-LD, and sitemaps. See [Hugo SEO Implementation Guide](hugo-seo.md).

**Shortcode**: a Hugo template called from inside Markdown content, such as the theme's gallery slider. See [Gallery Slider Documentation](gallery-slider.md), [SOTA: Hugo](SOTA_hugo.md#findings).

**Static site generator**: a tool that compiles content and templates into plain HTML at build time; Hugo is the generator used throughout these notes. See [Hosting Your Hugo Site](hosting-guide.md), [SOTA: Hugo](SOTA_hugo.md).

**Umami**: a minimal, privacy-focused self-hosted analytics service. See [Self-Hosted Analytics for PKB-theme](analytics-setup.md).

**Web Speech API**: the browser API (`speechSynthesis`) behind the theme's read-aloud feature. See [Text to Speech](text-to-speech.md).
