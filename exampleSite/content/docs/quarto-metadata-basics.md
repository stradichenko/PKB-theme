---
title: "Quarto Metadata Basics"
lastmod: 2025-01-17T17:26:20+02:00
draft: false
description: "Complete guide to configuring Quarto document metadata, including YAML front matter, execution options, and PKB theme integration."
comments: false
series: []
tags: ["quarto", "metadata", "yaml", "configuration", "documentation"]
categories: ["docs", "guides"]
slug: "quarto-metadata-basics"
toc: true
sidenotes: true
image: "images/docs/quarto-metadata-basics/quarto-metadata-basics.jpg"
alt: "YAML metadata configuration in a code editor with Quarto document structure"
---

Understanding Quarto metadata is crucial for creating well-structured, properly configured documents that integrate seamlessly with the PKB theme. Take into account that to adequately deploy a site with this HUGO, [other steps are necessary](/docs/rendering-code-with-quarto/). This guide covers everything from basic YAML syntax to advanced configuration options for the `qmd` metadata necessary as a first step.

## What is Quarto Metadata?

Quarto metadata is defined in YAML format at the beginning of your document, enclosed between triple dashes (`---`). It controls:

- **Document properties**: Title, author, date
- **Rendering behavior**: Output format, code execution
- **Hugo integration**: Front matter for static site generation
- **Styling options**: Themes, layouts, custom CSS

## Basic YAML Structure

### Standard Document Metadata

```yaml
---
title: "My Research Paper"
author: "Dr. Jane Smith"
date: "2025-01-17"
format: html
---
```

### Hugo-Compatible Front Matter

For PKB theme integration, include Hugo-specific fields:

```yaml
---
title: "Data Science Tutorial"
author: "Your Name"
date: 2025-01-17T10:30:00+02:00
lastmod: 2025-01-17T10:30:00+02:00
draft: false
description: "A comprehensive tutorial on data science fundamentals"
comments: true
series: ["Data Science Basics"]
tags: ["data-science", "python", "tutorial"]
categories: ["tutorials"]
slug: "data-science-tutorial"
toc: true
sidenotes: true
image: "images/posts/data-science-tutorial/header.jpg"
alt: "Data visualization charts and code"
---
```

## Quarto-Specific Metadata

### Format Configuration

```yaml
---
title: "Multi-Format Document"
format:
  html:
    toc: true
    theme: cosmo
  hugo-md:
    toc: true
    code-fold: false
  pdf:
    geometry: margin=1in
    fontsize: 12pt
---
```

### Execution Options

```yaml
---
title: "Executable Document"
jupyter: python3
execute:
  cache: true
  freeze: auto
  echo: true
  warning: false
  error: false
---
```

### Cell Options

Common cell options that work in both R and Python code cells:

```yaml
#| echo: false          # Hide code, show output
#| eval: false          # Show code, don't execute
#| include: false       # Execute but hide everything
#| warning: false       # Hide warnings
#| error: false         # Hide errors
#| output: false        # Hide output
#| fig-cap: "Caption"   # Figure caption
#| fig-width: 8         # Figure width
#| fig-height: 6        # Figure height
#| label: fig-name      # Cross-reference label
#| cache: true          # Cache this cell
```

### R-Specific Cell Options

Options that only work in R code chunks:

```r
#| message: false       # Hide R messages (package loading, etc.)
#| results: "hide"      # Hide text output ("markup", "asis", "hold", "hide")
#| collapse: true       # Merge input and output blocks
#| fig-show: "hold"     # Control figure display ("hold", "asis", "animate")
#| dependson: "chunk1"  # Specify chunk dependencies for caching
#| comment: "#>"        # Change comment prefix for output
#| prompt: false        # Don't show R prompt in output
#| tidy: false          # Don't reformat R code
#| size: "small"        # Font size for code ("tiny", "scriptsize", "footnotesize", "small", "normalsize", "large", "Large")
```

### Python-Specific Cell Options

Options specific to Python (Jupyter) cells:

```python
#| tags: []             # Jupyter cell tags
#| lines_to_next_cell: 2 # Spacing to next cell in .py format
#| name: "cell-name"    # Cell name for debugging
```

### Bibliography and Citations

```yaml
---
title: "Research Paper"
bibliography: references.bib
csl: apa.csl
cite-method: biblatex
link-citations: true
---
```

## PKB Theme Integration

### Required Fields for PKB

Essential metadata for proper PKB theme rendering:

```yaml
---
# Core Hugo fields
title: "Your Post Title"
date: 2025-01-17T10:30:00+02:00
draft: false

# PKB theme specifics
description: "Brief, SEO-friendly description"
slug: "url-friendly-slug"
toc: true
sidenotes: true
image: "images/posts/your-post/header.jpg"
alt: "Descriptive alt text for accessibility"

# Quarto specifics
format: hugo-md
jupyter: python3
---
```

### Optional PKB Fields

```yaml
---
# ...existing required fields...

# Social and engagement
comments: true
share: true

# Organization
series: 
  - name: "Tutorial Series"
    part: 1
    total: 5
tags: ["tutorial", "beginner", "python"]
categories: ["tutorials", "data-science"]

# SEO and social media
keywords: ["data science", "machine learning"]
canonical: "https://yoursite.com/posts/original-post"

# Custom styling
custom_css: ["custom/post-styles.css"]
custom_js: ["custom/interactive.js"]
---
```

## Common Metadata Patterns

### Academic Paper Template

```yaml
---
title: "Impact of Machine Learning on Healthcare"
subtitle: "A Systematic Review"
author: 
  - name: "Dr. Sarah Johnson"
    affiliation: "University Medical Center"
    email: "s.johnson@university.edu"
  - name: "Prof. Michael Chen"
    affiliation: "Data Science Institute"
date: "2025-01-17"
abstract: |
  This paper examines the current state of machine learning
  applications in healthcare, analyzing 150 recent studies...
keywords: ["machine learning", "healthcare", "systematic review"]
bibliography: healthcare-ml.bib
format:
  hugo-md:
    number-sections: true
    toc: true
  pdf:
    documentclass: article
    fontsize: 11pt
    geometry: margin=1in
---
```

### Tutorial Template

```yaml
---
title: "Getting Started with Python for Data Analysis"
author: "Tutorial Team"
date: 2025-01-17T14:00:00+02:00
lastmod: 2025-01-17T14:00:00+02:00
draft: false
description: "Learn Python data analysis from scratch with hands-on examples and exercises"
comments: true
series: ["Python for Data Science"]
tags: ["python", "pandas", "data-analysis", "beginner"]
categories: ["tutorials", "programming"]
slug: "python-data-analysis-basics"
toc: true
sidenotes: true
image: "images/tutorials/python-basics/python-pandas.jpg"
alt: "Python code with pandas dataframe operations"

# Quarto configuration
format: hugo-md
jupyter: python3
execute:
  cache: true
  warning: false
  error: false
  echo: true
editor:
  render-on-save: true
---
```

### Report Template

```yaml
---
title: "Quarterly Sales Analysis Report"
author: "Analytics Team"
date: 2025-01-17T09:00:00+02:00
draft: false
description: "Comprehensive analysis of Q4 2024 sales performance with actionable insights"
tags: ["sales", "analytics", "quarterly-report", "business-intelligence"]
categories: ["reports", "business"]
slug: "q4-2024-sales-analysis"
toc: true
sidenotes: false
image: "images/reports/q4-sales/sales-dashboard.jpg"
alt: "Sales performance dashboard with charts and KPIs"

# Quarto configuration
format:
  hugo-md:
    code-fold: true
    code-summary: "Show analysis code"
  pdf:
    documentclass: report
    toc: true
jupyter: python3
execute:
  cache: true
  echo: false
  warning: false
---
```

## Advanced Metadata Configuration

### Conditional Formatting

```yaml
---
title: "Cross-Platform Document"
format:
  html:
    toc: true
    theme: flatly
    code-tools: true
  hugo-md:
    toc: true
    code-fold: false
  pdf:
    documentclass: article
    keep-tex: true
  docx:
    reference-doc: template.docx
---
```

### Custom Execution Environment

```yaml
---
title: "Multi-Language Analysis"
jupyter: python3
execute:
  cache: refresh
  freeze: false
  daemon: 3600
engine: knitr
filters:
  - quarto
resources:
  - "data/*.csv"
  - "images/plots/"
---
```

### Advanced Citation Configuration

```yaml
---
title: "Literature Review"
bibliography: 
  - main-refs.bib
  - supplementary.bib
csl: nature.csl
citation:
  type: article-journal
  container-title: "Journal of Data Science"
  issued: 2025
nocite: |
  @item1, @item2
suppress-bibliography: false
link-citations: true
---
```

## Metadata Validation and Best Practices

### YAML Syntax Rules

{{< warning >}}
**YAML Syntax Requirements:**
1. **Indentation**: Use 2 spaces (no tabs)
2. **Quotes**: Use quotes for strings with special characters
3. **Lists**: Use hyphen notation or bracket notation
4. **Booleans**: Use `true`/`false` (lowercase)
5. **Dates**: Use ISO 8601 format
{{< /warning >}}

### Common Mistakes to Avoid

```yaml
# ❌ Wrong
date: 01/17/2025        # Ambiguous date format
draft: "false"          # String instead of boolean
tags: machine learning  # Missing quotes for multi-word

# ✅ Correct
date: 2025-01-17T10:30:00+02:00
draft: false
tags: ["machine-learning", "data-science"]
```

### Validation Tools

Use `quarto check` to validate your document:

```bash
# Check document structure
quarto check document.qmd

# Validate specific metadata
quarto inspect document.qmd
```

## Environment-Specific Configuration

### Development vs. Production

Use different configurations for different environments:

```yaml
---
title: "My Analysis"
# Development settings
draft: true
execute:
  cache: false
  freeze: false

# Production overrides (in _metadata.yml)
# draft: false
# execute:
#   cache: true
#   freeze: auto
---
```

### Project-Level Metadata

Create `_metadata.yml` in your content directory:

```yaml
# _metadata.yml
author: "Data Science Team"
execute:
  cache: true
  freeze: auto
format:
  hugo-md:
    code-fold: false
    toc: true
```

## Troubleshooting Metadata Issues

### Common Error Messages

{{< note >}}
**Common Issues and Solutions:**

1. **YAML parsing errors**:
   ```bash
   # Check for indentation and syntax
   quarto render document.qmd --verbose
   ```

2. **Missing required fields**:
   ```yaml
   # Ensure Hugo requires these minimum fields
   title: "Required"
   date: 2025-01-17T10:30:00+02:00
   ```

3. **Invalid date formats**:
   ```yaml
   # Use ISO 8601 format
   date: 2025-01-17T10:30:00+02:00
   lastmod: 2025-01-17T10:30:00+02:00
   ```
{{< /note >}}

### Debugging Tips

```bash
# Check metadata parsing
hugo config

# Validate YAML syntax
yamllint document.qmd

# Test rendering
quarto render document.qmd --verbose
```

## Metadata Templates and Snippets

### VS Code Snippet

Create a snippet for consistent metadata:

```json
{
  "Quarto PKB Post": {
    "prefix": "qpkb",
    "description": "Quarto document with PKB theme metadata"
  }
}
```

### Shell Script for New Posts

```bash
#!/bin/bash
# create-quarto-post.sh

TITLE="$1"
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
DATE=$(date +"%Y-%m-%dT%H:%M:%S%z")
DIR="content/posts/$SLUG"

mkdir -p "$DIR"
cat > "$DIR/index.qmd" << EOF
---
title: "$TITLE"
author: "Your Name"
date: $DATE
lastmod: $DATE
draft: true
description: ""
tags: []
categories: []
slug: "$SLUG"
toc: true
sidenotes: true
image: "images/posts/$SLUG/header.jpg"
alt: ""
format: hugo-md
jupyter: python3
---

# Introduction

Your content here...
EOF

echo "Created new Quarto post: $DIR/index.qmd"
```

## Conclusion

Proper metadata configuration is essential for creating professional Quarto documents that integrate seamlessly with the PKB theme. Remember to:

- Use consistent YAML syntax and formatting
- Include all required Hugo front matter fields
- Configure Quarto-specific execution options appropriately
- Validate your metadata before publishing
- Use templates and snippets for consistency
- Test rendering across different formats

With these fundamentals, you'll be able to create well-structured, properly configured documents that take full advantage of both Quarto's capabilities and the PKB theme's features.
echo "Created new Quarto post: $DIR/index.qmd"
```

## Conclusion

Proper metadata configuration is essential for creating professional Quarto documents that integrate seamlessly with the PKB theme. Remember to:

- Use consistent YAML syntax and formatting
- Include all required Hugo front matter fields
- Configure Quarto-specific execution options appropriately
- Validate your metadata before publishing
- Use templates and snippets for consistency
- Test rendering across different formats

With these fundamentals, you'll be able to create well-structured, properly configured documents that take full advantage of both Quarto's capabilities and the PKB theme's features.
