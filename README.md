<h1 align="center">
  PKB-theme |<a href="https://stradichenko.github.io/PKB-theme/">Demo</a>
</h1>

<h3 align="center">

![CI Status](https://github.com/stradichenko/PKB-theme/actions/workflows/test.yml/badge.svg)
![GitHub License](https://img.shields.io/github/license/stradichenko/PKB-theme)
![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/stradichenko/PKB-theme)
[![PKB-theme](https://img.shields.io/badge/Hugo--Themes-@PKB-theme)](https://themes.gohugo.io/themes/)

</h3>

<h4 align="center">
  Consider supporting:<br><br>
  <img src="https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white">
  <img src="https://img.shields.io/badge/Liberapay-F6C915?style=for-the-badge&logo=liberapay&logoColor=black">
  <a href="https://github.com/sponsors/stradichenko">
    <img src="https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA">
  </a>
</h4>

<h4 align="center">

[![X (formerly Twitter) URL](https://img.shields.io/badge/-Share%20on%20X-gray?style=flat&logo=x)](https://x.com/intent/tweet/?text=PKB-theme!%20A%20resource%20to%20easily%20launch%20your%20personal%20blog!%20&url=https://github.com/stradichenko/PKB-theme&hashtags=Hugo,pkbtheme,blog)
</h4>


## About
This template is meant for a blog oriented towards a [Personal Knowledge Management (PKB)](https://www.wikiwand.com/en/Personal_knowledge_base). The theme is inspired by some subjects of [Edward Tufte's work](https://edwardtufte.github.io/tufte-css/), the PKB, and Gwerns' [blog design](https://gwern.net/design). Meant to work in conjuction with for the [CMS-PKB-Blogger project](https://github.com/stradichenko/PKB-Blogger/tree/main).

## Installation
⚠️ For the most part of the instructions we assume that you are creating a site from scratch.

Have [HUGO](https://gohugo.io/installation/) and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed in your system.

### As a Hugo Module (recommended)
A [module](https://gohugo.io/hugo-modules/use-modules/#article) is a collection of related Go packages versioned together as a single unit. 
From your project's root directory, initiate the hugo module system and add the theme's repo to your `hugo.toml`.

```bash
# 0. Create boilerplate files for your site, replace placeholder title (in case of testing locally anything like <example.com/my-blog> works fine):
hugo new site <your-site>
cd <your-site>

# 1 To initialize your blog as a module, create a go.mod file with the following command. And to be able to push it as a repository, say as a Github repo, follow this pattern:
hugo mod init github.com/<your-username>/<your-blog>


# 2. add theme module to site
cat <<EOF >> hugo.toml

[module]
  [[module.imports]]
    path = 'github.com/stradichenko/PKB-theme'
EOF

# 2.1 for better file organization
mkdir -p config/_default/ config/development/ static/bibtex/ static/images/ static/img static/my-favicon && mv ./hugo.toml config/_default/
curl -L -o config/development/hugo.toml https://github.com/stradichenko/PKB-theme/raw/main/config/development/hugo.toml

# 3. Download the theme as a module
hugo mod get

# removes_unused Dependencies not referenced in config, updates checksum, Verifies module integrity. optimizes module dependency tree
hugo mod tidy

# Verify what changed
git diff go.mod go.sum
# > github.com/<your-username>/<your-blog> github.com/stradichenko/PKB-theme@v....

# just to make sure the the theme was imported 
hugo mod graph

# If you ever need to see a local copy of all module files, you can use the command `hugo mod vendor`, which will copy all module dependencies into a _vendor/ folder.

# 4.1 This will copy params for the user to customize his blog
curl -L -o config/_default/params.toml https://github.com/stradichenko/PKB-theme/raw/main/config/_default/params.toml

# 4.2 To render the about page
curl -L -o content/about.md https://github.com/stradichenko/PKB-theme/raw/main/exampleSite/content/about.md

# 4.2 The menu itemos for the header
curl -L -o config/_default/menus.toml https://github.com/stradichenko/PKB-theme/raw/main/config/_default/menus.toml

# test blog with drafts
rm -rf .cache/hugo/ resources/ public/ tmp/ .hugo_build.lock && hugo server --source . --noHTTPCache --renderToMemory --disableFastRender --ignoreCache --gc --logLevel debug -D -e development
```

The easiest way to keep the module updated while allowing you to populate the theme with your preferences is to copy the `params` (or any other file) as a local copy and customize. 

Since Hugo gives precedence to local files over module's files, any customizations (such as personal profile information) remain in place even if the theme updates in the future. So for any file you can follow the following pattern (a glorified COPY + PASTE):

```bash
curl -L -o path/to/file/file https://github.com/stradichenko/PKB-theme/raw/main/path/to/file/file
```

### How to update the theme
```bash
# Weekly/monthly routine
rm -rf .cache/hugo/ resources/ public/ .hugo_build.lock
# Update all modules
hugo mod get -u
# Clean dependencies
hugo mod tidy
# Verify what changed
git diff go.mod go.sum
# Verify integrity
hugo mod verify
```

## Getting Started


### Creating your first post
The simplest way to create a post is using the archetype implicitly declared by the path; So, to create a post it will follow:

```bash
# e.g.
hugo new content content/posts/my-first-post.md

# for any other archetype it will follow the pattern:
hugo new content content/<archetype>/<filename>
``` 

### Testing on local
Inside your blog folder you can always use the command `hugo server` and check it with [localhost:1313](http://localhost:1313/) (if port is free) in the address bar of your browser. The `hugo server ...` is useful for live previewing changes as you develop your site. Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop Hugo’s local development server.

### [Publishing your site](https://stradichenko.github.io/PKB-theme/docs/hosting-guide)


## Configure your site (WIP)
Described at [documentation](https://github.com/stradichenko/PKB-theme/blob/main/documentation), these are the initial steps to understand how you can customize your blog to your liking.

### [Color Theme Customization](https://stradichenko.github.io/PKB-theme/docs/color-theme-customization)


## FAQ
### Hugo's Theme Configuration Inheritance (Lookup Order)

Hugo uses a configuration cascade system that allows for easy theme customization without modifying the original theme files. The configuration is processed in the following priority order (highest to lowest):

1. Project-level configuration (your site's config files)
2. Environment-specific configuration
3. Theme's default configuration

When using PKB-theme as a module or submodule, you can override any theme settings by specifying them in your project's configuration file. For example, if the theme has these default parameters:

```toml
[params]
  mainColor = "blue"
  showSidebar = true
```

You can override them in your project's config file:

```toml
[params]
  mainColor = "red"    # This overrides the theme's blue
  showSidebar = false  # This overrides the theme's true
```

This inheritance system ensures that:
- Your customizations remain intact when the theme updates
- You can maintain a clean separation between theme code and your configurations
- You don't need to modify theme files directly
- You can easily revert to theme defaults by removing overrides

#### Practical Example: Customizing Theme Components

To customize specific theme components while maintaining the ability to update the theme, you can:

1. **Identify the theme component** you want to customize (e.g., footer partial)
2. **Copy the component** from the theme to your site's directory
3. **Modify your copy** as needed

For example, to customize the footer:

```bash
# 1. Create the partials directory in your site if it doesn't exist
mkdir -p layouts/partials

# 2. Copy the footer partial from the theme
curl -L -o layouts/partials/footer.html https://github.com/stradichenko/PKB-theme/raw/main/layouts/partials/footer.html
```

Now you can modify `layouts/partials/footer.html` with your custom content. Hugo will:
- Use your customized footer instead of the theme's version
- Preserve your changes when the theme updates
- Allow you to revert to the theme's footer by simply deleting your copy

This same approach works for any theme component you want to customize:
- Layout files
- Partial templates
- Shortcodes
- Static assets
- CSS/JS files

#### Example: Customizing Footer Message

The footer message can be customized through your site's configuration file without copying any theme files. Simply add to your `config.toml`:

```toml
[params.footer]
    customText = "My Custom Footer Message"
```

This will override the theme's default footer message while maintaining upgradeability, as your configuration takes precedence over the theme's default configuration.

---

<div align="center">
  <img src="https://repobeats.axiom.co/api/embed/00d9b6535bf8f99efb9d450cc1600784b0f60bbd.svg" alt="Repobeats analytics image" />
</div>

