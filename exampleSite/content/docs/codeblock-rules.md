---
title: "Codeblock Rules"
author: "Your Name"
date: 2025-07-17T18:54:56+02:00
lastmod: 2025-07-17T18:54:56+02:00
draft: false
description: "Complete guide to styling and customizing codeblocks in the PKB theme" # Brief summary of the post.
comments: false  # Enable Remark42 comments by default
series: []
# for more control:
#   name:
#   part:
#   total:
tags: ["documentation", "codeblocks", "syntax-highlighting"]
categories: ["docs"]
slug: "codeblock-rules"
toc: true
sidenotes: true
image: "images/docs/codeblock-rules/codeblock-rules.jpg" # make sure that the name corresponds to jpg, jpeg, png, etc.
alt: "Code editor with syntax highlighting" # Alt text for the header image (accessibility)
---

This guide covers all the ways you can style and customize codeblocks in the PKB theme, from basic syntax highlighting to advanced features like line numbers and copy buttons.

## Basic Syntax Highlighting

The theme supports syntax highlighting for numerous programming languages. Simply specify the language after the opening triple backticks:

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

## Inline Code

Use single backticks for inline code: `const variable = "value"` or `git commit -m "message"`.

## Code with Line Numbers

Add line numbers to your codeblocks for easier reference:

```javascript {linenos=true}
class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(value) {
        this.result += value;
        return this;
    }
    
    multiply(value) {
        this.result *= value;
        return this;
    }
}
```

## Highlighting Specific Lines

Highlight important lines to draw attention:

```python {linenos=true,hl_lines=[3,7]}
def process_data(data):
    results = []
    for item in data:  # This line is highlighted
        if item.is_valid():
            processed = transform(item)
            results.append(processed)
        else:  # This line is highlighted
            log_error(f"Invalid item: {item}")
    return results
```

## Line Number Starting Point

Start line numbering from a specific number:

```bash {linenos=true,linenostart=42}
echo "Starting from line 42"
ls -la
cd /home/user
git status
```

## Code with Title/Filename

Add a title or filename to your codeblocks:

```javascript {title="utils.js"}
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

## Long Code Examples

For longer code examples, the theme provides proper scrolling:

```sql
SELECT 
    u.id,
    u.username,
    u.email,
    p.title as profile_title,
    p.bio,
    COUNT(po.id) as post_count,
    AVG(r.rating) as average_rating
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN posts po ON u.id = po.author_id
LEFT JOIN reviews r ON po.id = r.post_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    AND u.status = 'active'
GROUP BY u.id, u.username, u.email, p.title, p.bio
HAVING post_count > 5
ORDER BY average_rating DESC, post_count DESC
LIMIT 50;
```

## Configuration Files

Perfect for showing configuration examples:

```yaml {title="config.yml"}
server:
  host: localhost
  port: 8080
  ssl:
    enabled: true
    cert_file: /path/to/cert.pem
    key_file: /path/to/key.pem

database:
  driver: postgresql
  host: db.example.com
  port: 5432
  name: myapp
  user: dbuser
  password: ${DB_PASSWORD}
  pool:
    max_connections: 20
    idle_timeout: 30s

logging:
  level: info
  format: json
  outputs:
    - stdout
    - file:/var/log/app.log
```

## Terminal Commands

Style terminal commands and outputs:

```bash
$ npm install --save-dev webpack webpack-cli
$ webpack --mode development
Hash: 7f3bac4a2e8b7c9d1e2f
Version: webpack 5.74.0
Time: 1234ms
Built at: 01/01/2024 12:00:00 PM
  Asset      Size  Chunks                         Chunk Names
main.js  1.2 MiB    main  [emitted]              main
```

## Code Diffs

Show code changes with diff syntax:

```diff
function calculateTotal(items) {
-   let total = 0;
+   let total = 0.0;
    for (const item of items) {
-       total += item.price;
+       total += parseFloat(item.price) || 0;
    }
+   total = Math.round(total * 100) / 100;
    return total;
}
```

## Multiple Language Examples

Compare implementations across languages:

**JavaScript:**
```javascript
const users = await fetch('/api/users')
    .then(response => response.json())
    .then(data => data.users);
```

**Python:**
```python
import requests

response = requests.get('/api/users')
users = response.json()['users']
```

**Go:**
```go
resp, err := http.Get("/api/users")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

var result struct {
    Users []User `json:"users"`
}
json.NewDecoder(resp.Body).Decode(&result)
```

## Advanced Features

### Copy Button

All codeblocks automatically include a copy button for easy copying.

### Responsive Design

Codeblocks are fully responsive and will scroll horizontally on smaller screens while maintaining readability.

### Syntax Support

The theme supports syntax highlighting for:

- **Web**: HTML, CSS, JavaScript, TypeScript, PHP
- **Backend**: Python, Go, Java, C#, Ruby, Rust
- **Data**: SQL, JSON, YAML, TOML, XML
- **Shell**: Bash, PowerShell, Zsh
- **Config**: Dockerfile, Nginx, Apache
- **Markup**: Markdown, LaTeX
- And many more...

## Best Practices

1. **Always specify the language** for proper syntax highlighting
2. **Use line numbers** for longer code examples that will be discussed
3. **Highlight important lines** to guide reader attention
4. **Add titles/filenames** to provide context
5. **Keep code examples focused** - show only relevant parts
6. **Use diff format** when showing changes
7. **Group related code examples** under clear headings

## Accessibility

- All codeblocks have proper ARIA labels
- High contrast syntax highlighting ensures readability
- Keyboard navigation is supported
- Screen readers can properly interpret code structure
