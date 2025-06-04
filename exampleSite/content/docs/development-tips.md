+++
title = "Development Tips"
date = 2023-07-04T09:00:00-07:00
draft = false
tags = ["development", "hugo", "tips", "documentation"]
categories = ["guides", "documentation"]
toc = true
description = "Development tips and useful commands for PKB-theme development"
+++

# Development Tips

## Serving exampleSite

For theme development, use this command to serve the exampleSite with debug options:

```bash
hugo server \
  --source exampleSite \  # Point to exampleSite directory
  --noHTTPCache \         # Disable HTTP caching
  --renderToMemory \      # Render to memory
  --disableFastRender \   # Disable fast render
  --ignoreCache \         # Ignore cache
  --gc \                  # Run garbage collection
  --logLevel debug \      # Set debug log level
  -D                      # Include draft posts
```

### Command Explanation

- `--source exampleSite`: Serves the example site instead of the main project
- `--noHTTPCache`: Prevents browser caching during development
- `--renderToMemory`: Renders pages in memory for faster development
- `--disableFastRender`: Forces full re-render of changed pages
- `--ignoreCache`: Ignores the cache when rebuilding
- `--gc`: Runs garbage collection after builds
- `--logLevel debug`: Shows detailed debug information
- `-D`: Includes draft content

## Local Testing

For production testing, remove debug flags:

```bash
hugo server --source exampleSite
```

For more development tips, see the [Hugo documentation](https://gohugo.io/commands/hugo_server/).
