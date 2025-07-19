---
title: "Quarto Basics with PKB Theme"
author: "PKB Theme Documentation"
date: 2025-01-17T17:26:20+02:00
lastmod: 2025-01-17T17:26:20+02:00
draft: false
description: "Complete guide to creating and publishing Quarto documents with the PKB theme, including setup, configuration, and best practices."
comments: false
series: []
tags: ["quarto", "documentation", "publishing", "data-science", "r", "python", "jupyter"]
categories: ["docs", "guides"]
slug: "quarto-basics"
toc: true
sidenotes: true
image: "images/docs/quarto-basics/quarto-basics.jpg"
alt: "Quarto logo with code editor showing markdown and code blocks"
---

Quarto is an open-source scientific and technical publishing system that works in HUGO. This guide covers everything you need to know to create/display code outputs from code using a Quarto as integration.

## What is Quarto?

Quarto enables you to weave together content and executable code into a finished document. It supports:

- **Multiple languages**: Python, R, Julia, Observable JS
- **Multiple formats**: HTML, PDF, MS Word, presentations, websites
- **Interactive elements**: Plots, widgets, and dynamic content
- **Academic features**: Citations, cross-references, equations

## Installation and Setup

### 1. Install Quarto

Download and install Quarto from [quarto.org](https://quarto.org/docs/get-started/):

### 2. Verify Installation

```bash
quarto --version
```

### 3. Configure for PKB Theme

The PKB theme includes a specialized archetype for Quarto documents.

Hugo doesn't recognize .qmd (Quarto) files as a valid content format. Therefore, to have the proper metadata, Quarto has to parse the file first. 

```mermaid
GraphLR



```

And since there are many files generated; is best to create a [page bundle](https://gohugo.io/content-management/page-bundles/):

```
Hugo Site Structure
├── content/
│   └── posts/
│       └── my-analysis/
│           └── index.qmd
└── archetypes/
    └── quarto.md
```

The Quarto metadata should include at least `format: hugo-md`.

But is also recommended to add something like this:

```yaml
format: 
    hugo-md:
        fig-format: svg
        code-fold: true
execute:
  cache: true
  freeze: auto
```

Therefore to create a new Quarto posts using `index.qmd` as target in the Page Bundle:

```bash
quarto render content/posts/my-analysis/index.qmd
```

This will create a set of files, including a `md` file and corresponding.
Take into account that packages could miss but Quarto will warn you:

```bash
Error in `py_call_impl()`:
! ModuleNotFoundError: No module named 'plotly'
```

This can be solved by installed the necessary packages:

```bash
# for Python
pip install plotly
# for R (or just use RStudio)
Rscript -e 'install.packages("package_name", repos="https://cloud.r-project.org")'
```

```
hugo new content/posts/my-analysis.qmd --kind quarto
```

## Regarding Interactivity

Thus far it doesn't seem that graphical interactivty from Quarto to HUGO is manageable:

```bash
Loading required namespace: shiny


processing file: index.qmd
1/19                  
2/19 [unnamed-chunk-1]
3/19                  
4/19 [unnamed-chunk-2]
5/19                  
6/19 [unnamed-chunk-3]
7/19                  
8/19 [unnamed-chunk-4]
9/19                  
10/19 [unnamed-chunk-5]
11/19                  
12/19 [unnamed-chunk-6]
13/19                  
14/19 [unnamed-chunk-7]
15/19                  
16/19 [unnamed-chunk-8]
17/19                  
18/19 [unnamed-chunk-9]
19/19                  
output file: index.knit.md

Error: Runtime 'shiny_prerendered' is not supported for markdown_strict+raw_html+all_symbols_escapable+backtick_code_blocks+fenced_code_blocks+space_in_atx_header+intraword_underscores+lists_without_preceding_blankline+shortcut_reference_links output.
Please change the output type of this document to HTML.
Execution halted
```

Usually the HTML elements are generated from Quarto -> `HTML`; but since we do HUGO -> `HTML`; doesn't work as seamlessly; an alternative would be to Quarto -> `HTML` and cut/paste the snippets in the `md` file, but this may not be practical nor sustainable.

It's possible to add `Shiny` to HUGO but it needs more [configuration](https://www.njordy.com/2023/02/06/hugo-with-python-rshiny/).


This creates a file with the same Quarto metadata. Since this metadata is not initially compatible with HUGO is necessary to erase the Quarto metadata and manually write the rendered HUGO metadata (Is quite cumbersome but is the current method).

## Creating Your First Quarto Document

### Basic Structure

A Quarto document combines YAML metadata, markdown text, and executable code blocks:

````markdown
---
title: "Data Analysis Example"
author: "Your Name"
date: 2025-01-17
format: hugo-md
jupyter: python3
---

# Introduction

This document demonstrates data analysis using Python and Quarto.

```{python}
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load sample data
data = pd.read_csv('data/sample.csv')
print(f"Dataset shape: {data.shape}")
```

## Data Visualization

```{python}
#| label: fig-scatter
#| fig-cap: "Relationship between variables"
#| fig-width: 8
#| fig-height: 6

plt.figure(figsize=(8, 6))
plt.scatter(data['x'], data['y'], alpha=0.6)
plt.xlabel('X Variable')
plt.ylabel('Y Variable')
plt.title('Scatter Plot Analysis')
plt.grid(True, alpha=0.3)
plt.show()
```

## Statistical Analysis

```{python}
# Calculate correlation
correlation = data['x'].corr(data['y'])
print(f"Correlation coefficient: {correlation:.3f}")
```

The correlation between X and Y is `{python} f"{correlation:.3f}"`.
````

### Code Chunk Options

Control code execution and output with chunk options:

```python
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
```

## Integration with PKB Theme Features

### Citations and References

Quarto works with the PKB theme's citation system:

```markdown
According to recent research [@smith2023], the method shows promise.

Multiple citations can be combined [@doe2022; @jones2023].
```

Add your bibliography file to the front matter:

```yaml
bibliography: references.bib
```

### Sidenotes

Combine Quarto with PKB theme sidenotes:

```markdown
This is important information^[This appears as a sidenote in the PKB theme].

The analysis shows significant results^[See appendix for detailed statistics].
```

### Mathematical Equations

Use LaTeX syntax for equations (rendered by MathJax):

```markdown
The linear regression model is:

$$y = \beta_0 + \beta_1 x + \epsilon$$

Where $\beta_0$ is the intercept and $\beta_1$ is the slope.
```


## Multi-language Support

### Python Example

```python
#| label: python-analysis
#| fig-cap: "Python data analysis"

import pandas as pd
import seaborn as sns

# Create sample data
df = pd.DataFrame({
    'x': np.random.randn(100),
    'y': np.random.randn(100),
    'category': np.random.choice(['A', 'B', 'C'], 100)
})

# Create visualization
sns.scatterplot(data=df, x='x', y='y', hue='category')
plt.title('Multi-category Analysis')
plt.show()
```

### R Example

```r
#| label: r-analysis
#| fig-cap: "R statistical analysis"

library(ggplot2)
library(dplyr)

# Create sample data
data <- data.frame(
  x = rnorm(100),
  y = rnorm(100),
  category = sample(c("A", "B", "C"), 100, replace = TRUE)
)

# Create visualization
ggplot(data, aes(x = x, y = y, color = category)) +
  geom_point(alpha = 0.7) +
  theme_minimal() +
  labs(title = "R Analysis Example")
```

## Publishing Workflow

### 1. Development Process

```bash
# Create new Quarto post
hugo new content/posts/my-analysis.qmd --kind quarto

# Edit content in your preferred editor
code content/posts/my-analysis.qmd

# Render to Hugo markdown
quarto render content/posts/my-analysis.qmd --to hugo-md

# Preview with Hugo
hugo server
```

### 2. Rendering Options

**For Hugo (recommended):**
```bash
quarto render document.qmd --to hugo-md
```

**For standalone HTML:**
```bash
quarto render document.qmd --to html
```

**For PDF:**
```bash
quarto render document.qmd --to pdf
```

### 3. Automated Workflow

Create a `_quarto.yml` file in your project root:

```yaml
project:
  type: website
  output-dir: public

website:
  title: "My Research Blog"
  navbar:
    left:
      - href: index.qmd
        text: Home
      - about.qmd

format:
  hugo-md:
    code-fold: false
    toc: true
```

## Best Practices

### 1. File Organization

```
content/
├── posts/
│   ├── 2025-01-17-analysis/
│   │   ├── index.qmd
│   │   ├── data/
│   │   │   └── sample.csv
│   │   └── images/
│   │       └── plot.png
│   └── _metadata.yml
```

### 2. Data Management

```python
# Use relative paths for data
import os
data_path = os.path.join('data', 'sample.csv')
df = pd.read_csv(data_path)
```

### 3. Reproducibility

```yaml
---
title: "Reproducible Analysis"
execute:
  cache: true
  freeze: auto
jupyter: python3
---
```

### 4. Code Quality

```python
#| code-fold: true
#| code-summary: "Data preprocessing steps"

def clean_data(df):
    """Clean and preprocess the dataset."""
    df = df.dropna()
    df = df[df['value'] > 0]
    return df

cleaned_data = clean_data(raw_data)
```

## Troubleshooting

### Common Issues

1. **Module not found errors**:
   ```bash
   # Install required packages
   pip install pandas matplotlib seaborn plotly
   ```

2. **Rendering errors**:
   ```bash
   # Check Quarto version
   quarto check
   
   # Render with verbose output
   quarto render document.qmd --verbose
   ```

3. **Image paths**:
   ```python
   # Use Hugo's static directory
   plt.savefig('static/images/plot.png')
   ```

### Configuration Tips

1. **Set up proper paths** in your `_quarto.yml`:
   ```yaml
   project:
     execute-dir: file
   ```

2. **Use environment variables** for sensitive data:
   ```python
   import os
   api_key = os.getenv('API_KEY')
   ```

3. **Configure code highlighting**:
   ```yaml
   format:
     hugo-md:
       highlight-style: github
   ```

## Advanced Features

### Cross-references

```markdown
See @fig-scatter for the relationship visualization.

As shown in @tbl-summary, the results are significant.
```

### Callout Blocks

```markdown
:::{.callout-note}
This is an important note about the analysis.
:::

:::{.callout-warning}
Be careful with data interpretation.
:::

:::{.callout-tip}
Pro tip: Use caching for expensive computations.
:::
```

### Tabbed Content

```markdown
::: {.panel-tabset}

## Python Code

```python
import pandas as pd
df = pd.read_csv('data.csv')
```

## R Code

```r
library(readr)
df <- read_csv('data.csv')
```

:::
```

## Conclusion

Quarto provides a powerful way to create reproducible, interactive documents that integrate seamlessly with the PKB theme. By following these guidelines, you can create professional-looking research documents, tutorials, and analyses that combine the best of both worlds: Hugo's static site generation and Quarto's scientific publishing capabilities.

Remember to:
- Use the PKB theme's Quarto archetype for consistent formatting
- Leverage the theme's citation and sidenote features
- Organize your code and data properly
- Test your rendering pipeline regularly
- Keep your environment and dependencies updated

For more advanced features and examples, check out the [official Quarto documentation](https://quarto.org/docs/).
