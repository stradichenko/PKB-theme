+++
title = "Improved Markdown tester"
date = 2025-02-01T09:00:00-07:00
draft = false
tags = ["documentation", "markdown", "reference", "formatting", "syntax"]
categories = ["guides", "tutorials"]
toc = true
sidenotes = true
comments = true
author = "Your Name"
description = "A comprehensive boilerplate showcasing all markdown features and sidenote usage"
+++

This document demonstrates all standard Markdown features along with proper sidenote usage.
Sidenotes work great with lists to provide additional context for specific items without breaking the list flow.
For more information about building effective knowledge bases, check out [Building a Personal Knowledge Base](/posts/personal-knowledge-base/).

## Basic Typography

Sidenotes work great with lists to provide additional context for specific items without breaking the list flow. {{< cite "smith2020" "/bibtex/references.bib" "apa" "true" >}}

**Bold text** and *italic text* are straightforward. You can also have ***bold italic text*** and ~~strikethrough~~.

{{< sidenote >}}
**Sidenotes can contain formatting too!** Use them for supplementary information that doesn't interrupt the main text flow.
{{< /sidenote >}}

If you're interested in advanced styling options, see our [Hugo Styling Guide](/posts/hugo-styling-guide/).

## Headings

Above was an H2. Here are other levels:

### H3 Heading

#### H4 Heading

##### H5 Heading

###### H6 Heading

Learn more about effective heading structure in our [Content Organization Guide](/posts/content-organization/).

## Lists

### Unordered Lists

- Item one
- Item two
  - Nested item a
  - Nested item b
- Item three

{{< sidenote >}}
Sidenotes work great with lists to provide additional context for specific items without breaking the list flow.
{{< /sidenote >}}

### Ordered Lists

1. First item
2. Second item
   1. Nested item 1
   2. Nested item 2
3. Third item

For more examples of how to use markdown for academic writing, see our [Academic Writing with Markdown](/posts/academic-writing/) guide.

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Links and Images

[External link](https://example.com) and [internal link](../another-post/)

![Image alt text](https://via.placeholder.com/150 "Image Title")

{{< sidenote >}}
Images can be further explained here without cluttering the main content.
{{< /sidenote >}}

## Code

Inline `code` is wrapped with backticks.

```python
# Code block with syntax highlighting
def hello_world():
    print("Hello, world!")
```

{{< sidenote >}}
Code explanations can be placed in sidenotes, keeping the code block clean while providing context.
{{< /sidenote >}}

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

{{< sidenote >}}
Provide information about the quote source or additional context here.
{{< /sidenote >}}

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Horizontal Rule

---

## Advanced Sidenote Usage

Plain text with a sidenote. {{< sidenote >}}
This is a standard sidenote. Use it for brief asides or clarifications.
{{< /sidenote >}}

Complex paragraph with multiple concepts that benefit from sidenotes.{{< sidenote >}}
First sidenote explaining an initial concept in detail without interrupting the paragraph flow.
{{< /sidenote >}} The text continues here with more information that might need explanation.{{< sidenote >}}
Second sidenote providing additional context or examples for another concept mentioned in the same paragraph.
{{< /sidenote >}}

### Sidenotes with References

Academic-style writing often uses sidenotes for citations.¹{{< sidenote >}}
¹ Author, N. (2023). Title of the work. Publisher. Page 42.
{{< /sidenote >}}

## Math Expressions

This theme supports mathematical expressions using KaTeX/MathJax rendering.

### Inline Math

Inline math is wrapped in single dollar signs: $E = mc^2$, $\alpha + \beta = \gamma$, $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$

{{< sidenote >}}
Inline math integrates seamlessly with your text flow for simple expressions and variables.
{{< /sidenote >}}

### Block Math

For standalone equations, use double dollar signs:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### Equation Arrays and Alignment

For multiple aligned equations:

$$
\begin{align}
f(x) &= (a+b)^2 \\
&= a^2 + 2ab + b^2
\end{align}
$$

### Matrices

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix} =
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$

### Complex Notation

$$
\iiint_V \vec{F} \cdot d\vec{v} = \oiint_S \vec{F} \cdot d\vec{S}
$$

{{< sidenote >}}
The above is Gauss's divergence theorem, showing volume integrals can be converted to surface integrals. Complex mathematical expressions benefit from sidenotes that explain the concepts without cluttering the formula.
{{< /sidenote >}}

### Numbered Equations

$$
\tag{1} E = mc^2
$$

### Chemical Equations

$$
\ce{H2O + CO2 -> H2CO3}
$$

## Footnotes

Standard markdown footnotes[^1] work like this.

[^1]: This is a footnote content.

## HTML in Markdown

<div style="color: blue;">
  Custom HTML can be included directly in markdown files if your renderer supports it.
</div>

## Conclusion

This boilerplate demonstrates the range of markdown features and proper sidenote usage. Copy, adapt, and extend for your own documents.
+++
