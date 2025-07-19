---
title: "Test on Archetype"
author: "John Doe"
date: 2025-07-05T14:34:09+02:00
lastmod: 2025-07-05T14:34:09+02:00
draft: false
description: "A comprehensive test post showcasing various markdown features, components, and theme capabilities including images, tables, code blocks, and references."
comments: true
series: ["Hugo Theme Testing"]
tags: ["testing", "markdown", "hugo", "theme", "archetype", "sample"]
categories: ["Development", "Testing", "Documentation"]
slug: "test-on-archetype"
toc: true
sidenotes: true
image: "images/posts/test-on-archetype/sina-saadatmand-gB9hryu1q40-unsplash.jpg"
alt: "Beautiful landscape photograph showcasing natural scenery and environmental elements" # Alt text for the header image (accessibility)
---

This is a comprehensive test post designed to showcase the various features and capabilities of the PKB theme. It includes multiple markdown elements, components, and formatting options to ensure everything renders correctly.

## Introduction

Welcome to our test archetype! This post demonstrates how different content types render within the theme. From basic text formatting to complex components like tables, code blocks, and mathematical expressions{{< sidenote >}}Sidenotes are particularly useful for additional context without breaking the reading flow{{< /sidenote >}}.

## Text Formatting

Here we test various **bold text**, *italic text*, and ***bold italic*** combinations. We can also use `inline code` and ~~strikethrough~~ text. 

> This is a blockquote that should render with proper styling. It can contain multiple lines and should maintain consistent formatting throughout.
> 
> — Author Name

{{< warning >}}
This is a warning message using the new warning shortcode. It's perfect for highlighting important information that users should pay attention to.
{{< /warning >}}

{{< note >}}
This is a note using the new note shortcode. Use it for additional information, tips, or clarifications that complement the main content.
{{< /note >}}

### Lists and Organization

Unordered lists work great for:
- Highlighting key points
- Organizing information
- Creating visual hierarchy
  - Nested items are supported
  - Multiple levels deep
    - Even deeper nesting

Ordered lists are perfect for:
1. Step-by-step instructions
2. Ranked information
3. Sequential processes
   1. Sub-steps work too
   2. Maintaining order is important

## Code Examples

Here's a simple JavaScript function:

```javascript
function greetUser(name) {
    const greeting = `Hello, ${name}!`;
    console.log(greeting);
    return greeting;
}

// Usage example
const user = "World";
greetUser(user);
```

And here's a Python example with syntax highlighting:

```python
def fibonacci(n):
    """Generate fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

# Example usage
print(fibonacci(10))
```

## Tables

Here's a comprehensive table showcasing different data types:

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Header Image | ✅ Complete | High | Displays correctly above metadata |
| TOC Generation | ✅ Complete | Medium | Auto-generated from headings |
| Sidenotes | 🔄 In Progress | Medium | Requires JavaScript enhancement |
| PDF Export | ❌ Pending | Low | Future implementation |
| Search | ✅ Complete | High | Full-text search available |

## Mathematical Expressions

The theme supports mathematical notation{{< sidenote >}}Mathematical expressions are rendered using MathJax or KaTeX depending on configuration{{< /sidenote >}}:

Inline math: $E = mc^2$

Block math:
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

Complex equation:
$$\frac{d}{dx}\left[ \int_{a}^{x} f(t) dt \right] = f(x)$$

## Links and References

External links work perfectly: [Hugo Documentation](https://gohugo.io/documentation/)

Internal links are also supported: [About Page](/about/)

Reference-style links can be defined[^1] and used throughout the document.

## Images and Media

Images can be embedded directly:

![Sample Image](https://via.placeholder.com/600x300/007ACC/FFFFFF?text=Sample+Image "Sample image for testing")

## Advanced Features

### Code Blocks with Line Numbers

```go {linenos=true}
package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("Hello, World!")
    
    // Current time
    now := time.Now()
    fmt.Printf("Current time: %s\n", now.Format("2006-01-02 15:04:05"))
    
    // Simple loop
    for i := 0; i < 5; i++ {
        fmt.Printf("Iteration %d\n", i)
    }
}
```

### Highlighted Code

```bash {hl_lines=[2,"4-6"]}
#!/bin/bash
echo "Starting deployment process..."
cd /var/www/html
git pull origin main
npm install
npm run build
echo "Deployment complete!"
```

## Conclusion

This test post demonstrates the rich feature set available in the PKB theme. From basic text formatting to advanced components like sidenotes, mathematical expressions, and syntax-highlighted code blocks, the theme provides a comprehensive platform for technical documentation and blogging.

The header image functionality{{< sidenote >}}As implemented in the recent template updates{{< /sidenote >}} adds visual appeal while maintaining clean, readable typography throughout the content.

---

## Footnotes

[^1]: This is a footnote that provides additional information without cluttering the main text. Footnotes are automatically numbered and linked.
