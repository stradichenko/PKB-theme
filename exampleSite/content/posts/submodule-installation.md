---
title: "Submodule Installation"
date: 2025-06-07T20:34:55+02:00
draft: true
comments: false  # Enable Remark42 comments by default
tags: []
categories: []
---


## Installation As Git submodule

```bash
hugo new site <YOURWEBSITENAME>
cd <YOURWEBSITENAME>
git init
git submodule add https://github.com/stradichenko/PKB-theme.git themes/PKB-theme
echo "theme = 'PKB-theme'" >> hugo.toml
```

## [What is the difference between submodule theme installation and module theme installation?](#key-differences-in-installation-methods)

### Key Differences in installation methods
When you install a theme as a Hugo module, Hugo manages the theme as a dependency rather than copying its files directly into your project's `themes/` folder. You’re telling Hugo to treat your project as a module. In practical terms, this command creates a `go.mod` file in your project’s root directory. This file is a key component of Go’s module system and serves as a manifest that lets Hugo manage dependencies (like themes or other modules) and control versioning. Without running this initialization, Hugo wouldn’t know to look for or handle module-based imports in your project.
- **Module Cache:** Hugo Modules are managed through Go's module system, which downloads and stores the theme in an internal module cache. The files remain there and are referenced during the build process.
- **Separation of Dependencies:** Unlike Git submodules, which add a physical copy of the theme into your repository (typically under themes/), Hugo Modules keep the dependency separate. This helps with cleaner project management and easier updates.
- **On-Demand Access:** The theme files are automatically fetched and used when you build your site. You don’t need a local copy in your themes/ folder for Hugo to incorporate them.

When you run `hugo mod init ...`,

| Method | Pros | Cons |
|--------|------|------|
| **Hugo Module** | Easier dependency management, automatic updates, no need to track theme files in your project. | Requires Hugo Modules (Go-based). |
| **Git Submodule** | Works well with Git workflows, allows manual control of theme updates. | More manual updates, extra Git commands needed. |

If you’re using **Hugo Modules**, you can just run:  
```sh
hugo mod get -u github.com/stradichenko/PKB-theme
cat go.mod | grep "github.com/stradichenko/PKB-theme"
```

If you’re using **Git submodules**, you need to run:  
```sh
git submodule update --remote --merge
```
to fetch the latest theme updates.
