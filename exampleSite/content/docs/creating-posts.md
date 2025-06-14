+++
title = "Creating Posts with Hugo"
date = 2025-01-20T10:00:00-07:00
draft = false
tags = ["hugo", "content creation", "posts", "documentation", "workflow"]
categories = ["guides", "documentation"]
toc = true
description = "Complete guide to creating new posts and content using Hugo's archetype system"
+++

Hugo provides a powerful content creation system using archetypes and the `hugo new` command. This guide explains how to create different types of content in your PKB-theme site.

## Understanding Hugo's Content Structure

Hugo organizes content in sections, which correspond to directories under `content/`. The PKB-theme supports several content types:

- **Posts** (`content/posts/`) - Blog articles and regular content
- **Docs** (`content/docs/`) - Documentation and guides  
- **Pages** (`content/about.md`) - Static pages like About, Contact

## The `hugo new` Command

The basic syntax for creating new content is:

```bash
hugo new content/<section>/<filename>.md
```

### Creating Blog Posts

To create a new blog post, use the posts archetype:

```bash
# Create a new post
hugo new content/posts/my-first-post.md

# Create a post with a specific date format
hugo new content/posts/$(date +%Y-%m-%d)-my-post-title.md

# Create a post in a subdirectory for organization
hugo new content/posts/tutorials/hugo-basics.md
```

**Example output:** This creates `content/posts/my-first-post.md` with the following frontmatter:

```yaml
---
title: "My First Post"
author: "Your Name"
date: 2025-01-20T10:30:00-07:00
lastmod: 2025-01-20T10:30:00-07:00
draft: true
description: ""
comments: false
series: []
tags: []
categories: []
slug: "my-first-post"
toc: true
sidenotes: true
image: "images/my-first-post.jpg"
---

Add your post content here...
```

### Creating Documentation

For documentation pages like guides and tutorials:

```bash
# Create documentation
hugo new content/docs/setup-guide.md
hugo new content/docs/api/authentication.md
```

This uses the default archetype and creates a minimal frontmatter structure.

### Creating Static Pages

For one-off pages like About or Contact:

```bash
# Create a top-level page
hugo new content/contact.md
hugo new content/privacy-policy.md
```

## Understanding Archetypes

Archetypes are templates that define the initial structure of new content. PKB-theme includes:

### Posts Archetype (`archetypes/posts.md`)

The posts archetype provides a comprehensive template with:
- **Author field** - Automatically populated from site params
- **SEO fields** - Description, slug, image
- **Content organization** - Tags, categories, series
- **Feature flags** - TOC, sidenotes, comments
- **Publishing control** - Draft status, dates

### Default Archetype (`archetypes/default.md`)

The default archetype provides:
- Basic title (auto-generated from filename)
- Creation date
- Draft status

## Frontmatter Fields Explained

### Essential Fields

```yaml
title: "Your Post Title"        # Display title
date: 2025-01-20T10:00:00Z     # Publication date
draft: true                     # Set to false to publish
```

### Content Organization

```yaml
tags: ["hugo", "tutorial"]           # Topic tags
categories: ["guides"]               # Content categories  
series: ["Hugo Basics"]              # Multi-part series
```

### SEO and Metadata

```yaml
description: "Brief summary"         # Meta description
slug: "custom-url-slug"             # Custom URL path
image: "images/featured.jpg"        # Featured image
```

### PKB-theme Features

```yaml
toc: true                           # Table of contents
sidenotes: true                     # Enable sidenotes
comments: false                     # Enable/disable comments
author: "Author Name"               # Post author
```

## Practical Workflow Examples

### Creating a Tutorial Series

```bash
# Create the first part
hugo new content/posts/hugo-series-part-1.md

# Edit the frontmatter:
series: ["Hugo Mastery"]
tags: ["hugo", "tutorial", "beginner"]
categories: ["tutorials"]
```

### Creating Technical Documentation

```bash
# Create API documentation
hugo new content/docs/api/getting-started.md

# Add technical tags
tags: ["api", "documentation", "reference"]
categories: ["technical"]
```

### Creating a Knowledge Base Entry

```bash
# Create a knowledge entry
hugo new content/posts/understanding-css-grid.md

# Configure for knowledge base
tags: ["css", "web development", "reference"]
categories: ["knowledge"]
sidenotes: true
toc: true
```

## Content Publishing Workflow

1. **Create the content:**
   ```bash
   hugo new content/posts/my-new-article.md
   ```

2. **Edit the content:**
   - Update frontmatter fields
   - Write your content using Markdown
   - Add sidenotes, citations, and other PKB-theme features

3. **Preview locally:**
   ```bash
   hugo server -D  # Include drafts
   ```

4. **Publish when ready:**
   ```yaml
   draft: false  # Change in frontmatter
   ```

5. **Build the site:**
   ```bash
   hugo  # Generate static files
   ```

## Content Organization Best Practices

### File Naming Conventions

- Use kebab-case: `my-blog-post.md`
- Include dates for time-sensitive content: `2025-01-20-announcement.md`
- Group related content in subdirectories: `tutorials/hugo-basics.md`

### Frontmatter Best Practices

- Always include meaningful descriptions for SEO
- Use consistent tag and category naming
- Set appropriate publication dates
- Configure TOC and sidenotes based on content length and type

### Content Structure

- Start with a clear introduction
- Use headings to structure your content
- Include internal links to related posts
- Add relevant tags and categories for discoverability

## Advanced Content Creation

### Batch Content Creation

Create multiple related posts:

```bash
# Create a series of related posts
for topic in "introduction" "advanced-features" "troubleshooting"; do
  hugo new content/posts/hugo-guide-${topic}.md
done
```

### Custom Archetypes

Create specialized archetypes for specific content types by adding files to the `archetypes/` directory.

### Automated Workflows

Consider using scripts or CI/CD to automate content creation and publishing workflows.

## Troubleshooting

### Common Issues

- **Command not found:** Ensure Hugo is installed and in your PATH
- **Archetype not found:** Check that archetype files exist in the correct location
- **Frontmatter errors:** Validate YAML syntax and field names
- **Content not appearing:** Verify draft status and publication dates

### Getting Help

- Check Hugo's [official documentation](https://gohugo.io/content-management/archetypes/)
- Review the [PKB-theme documentation](/docs/)
- Use `hugo help new` for command-line help

## Next Steps

After creating content:
- Learn about [Hugo's content organization](https://gohugo.io/content-management/organization/)
- Explore [Markdown formatting](/posts/markdown-boilerplate/) for PKB-theme
- Set up [automated deployment](/docs/github-pages-hugo/)

Remember: Always preview your content locally before publishing to ensure proper formatting and functionality.
