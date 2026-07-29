---
title: "Documentation Index"
description: "Entry point for the PKB-theme documentation notes, organized by subject."
date: 2026-07-28T12:00:00-05:00
lastmod: 2026-07-28T12:00:00-05:00
draft: false
tags: ["PKB", "index", "overview", "documentation"]
categories: ["documentation"]
toc: false
---

# Documentation Index

This note maps the documentation base by subject. Each entry links to a dedicated note, and the [glossary](glossary.md) defines the technical terms that recur across notes. The notes assume a working Hugo site built with PKB-theme: content creation and theme machinery first, then deployment, then the self-hosted services (analytics, ecommerce) the theme integrates with.

## Hugo and theme development

- [Creating Posts with Hugo](creating-posts.md): the content workflow, from archetypes and front matter to page bundles.
- [Hugo SEO Implementation Guide](hugo-seo.md): the meta tags, Open Graph, JSON-LD, and sitemap machinery built into the theme.
- [Development Tips](development-tips.md): day-to-day practices for working on the theme itself.
- [SOTA: Hugo Static Site Generator](SOTA_hugo.md): a fully sourced survey of Hugo through v0.164.0, with an upgrade plan grounded against this theme.

## Deployment and hosting

- [Hosting Your Hugo Site](hosting-guide.md): hosting-platform comparison and deployment steps.
- [Setting up GitHub Pages](github-pages-setup.md): first-time GitHub Pages setup for a Hugo site.
- [GitHub Pages with Hugo](github-pages-hugo.md): the Hugo-specific CI build and deploy pipeline.
- [Deploying with exampleSite](examplesite-deployment.md): using the bundled exampleSite as a deployment template.

## Analytics

- [Self-Hosted Analytics for PKB-theme](analytics-setup.md): choosing and wiring a privacy-friendly analytics backend.
- [Analytics Configuration](analytics-configuration.md): the theme's analytics params and supported providers.
- [Matomo Analytics Setup Guide](matomo-analytics-setup.md): a full Matomo self-hosting walkthrough.
- [Reverse Proxy Configuration for Analytics](reverse-proxy-setup.md): serving analytics first-party through your own domain.

## Ecommerce

- [Self-Hosted Ecommerce Solutions](ecommerce-solutions.md): comparison of the store platforms the notes integrate.
- [OpenCart Integration Guide](opencart-setup-guide.md): connecting an OpenCart store to the theme.
- [PrestaShop Integration Guide](prestashop-setup-guide.md): connecting a PrestaShop store to the theme.
- [Saleor Integration Guide](saleor-setup-guide.md): connecting a Saleor storefront to the theme.

## Theme components

- [Color Theme Customization](color-theme-customization.md): overriding the theme's color schemes.
- [Gallery Slider Documentation](gallery-slider.md): the gallery-slider shortcode and its options.
- [Portfolio Usage](portfolio-usage.md): the portfolio content type and its templates (draft, unpublished).
- [Text to Speech](text-to-speech.md): the browser-native read-aloud feature and its voice strategy.
