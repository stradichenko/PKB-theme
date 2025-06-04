+++
title = "Hugo Styling Guide"
date = 2025-01-25T11:15:00-07:00
draft = false
tags = ["hugo", "CSS", "design", "themes", "web development"]
categories = ["web development", "guides"]
toc = true
sidenotes = false
comments = true
author = "Your Name"
description = "A comprehensive guide to styling your Hugo website"
+++

# Hugo Styling Guide

This guide covers best practices for styling your Hugo website, with a focus on knowledge base themes.

## CSS Organization in Hugo

Hugo offers several approaches to CSS:

1. **Resources Pipeline** - Process SCSS/SASS files
2. **Asset Bundling** - Combine and minify CSS
3. **CSS Variables** - For theme customization

For markdown formatting options within your styled site, see our [Markdown reference](/posts/post-1/).

## Theme Components

### Typography

Typography forms the foundation of any knowledge base:

```css
:root {
  --font-family-sans: 'Inter', sans-serif;
  --font-family-serif: 'Georgia', serif;
  --font-family-mono: 'JetBrains Mono', monospace;
  --font-size-base: 16px;
}
```

### Color Schemes

Implement dark/light modes with CSS variables:

```css
:root {
  --color-primary: #4a90e2;
  --color-background: #ffffff;
  --color-text: #333333;
}

[data-theme="dark"] {
  --color-primary: #61dafb;
  --color-background: #1a202c;
  --color-text: #e2e8f0;
}
```

### Responsive Design

Use fluid sizing with `clamp()` for responsive typography:

```css
h1 {
  font-size: clamp(1.875rem, 1.5rem + 2vw, 2.75rem);
}
```

## Knowledge Graph Styling

When styling your [Personal Knowledge Base](/posts/personal-knowledge-base/), pay special attention to the knowledge graph component. The graph should be visually consistent with your theme while being functional.

## Hugo Templating for Style Components

Create reusable style components with Hugo partials:

```html
{{ partial "components/button.html" (dict "text" "Learn More" "href" "/posts/content-organization/" "class" "primary") }}
```

## Customizing Theme Variables

For practical organization tips that complement your styled site, see our [Content Organization Guide](/posts/content-organization/).
