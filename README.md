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
This template is meant for a blog oriented towards a [Personal Knowledge Management (PKB)](https://www.wikiwand.com/en/Personal_knowledge_base). The theme is inspired in some subjects of [Edward Tufte's work](https://edwardtufte.github.io/tufte-css/), the PKB, and Gwerns' [blog design](https://gwern.net/design). Meant to work in conjuction with for the [CMS-PKB-Blogger project](https://github.com/stradichenko/PKB-Blogger/tree/main).

## Installation
⚠️ For the most part of the instructions we assume that you are creating a site from scratch.

If you already have a populated HUGO site, make sure that this installation steps adjust to you context; check the [installation and customization flowchart](#installation-flowchart). For any other doubt, read the [FAQ](#faq).

Have [HUGO](https://gohugo.io/installation/) and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed in your system.

### As a Hugo Module (recommended)
From your project's root directory, initiate the hugo module system and add the theme's repo to your `config.toml`. A [module](https://gohugo.io/hugo-modules/use-modules/#article) is a collection of related Go packages that are versioned together as a single unit. 

```bash

# 0. Create boilerplate files for your site, replace placeholder title (in case of testing locally anything like <example.com/my-blog> works fine)
hugo new site <your-site>
cd <your-site>

# 1.2 To initialize say your blog as a module using Github for example; by creating a go.mod file
hugo mod init github.com/<your-username>/<your-blog>

# 2. add theme module to site
cat <<EOF >> hugo.toml

[module]
  [[module.imports]]
    path = 'github.com/stradichenko/PKB-theme'
EOF

# 2.1 for better file organization
mkdir -p config/_default/ config/development && mv ./hugo.toml config/_default/
curl -L -o config/development/hugo.toml https://github.com/stradichenko/PKB-theme/raw/main/config/development/hugo.toml

# 3. Download the theme as a module
hugo mod get

# removes_unused Dependencies not referenced in config, updates checksum, Verifies module integrity. optimizes module dependency tree
hugo mod tidy

# Verify what changed
git diff go.mod go.sum

# vendoring
hugo mod vendor

# 4. This will copy params for the user to customize
curl -L -o config/_default/params.toml https://github.com/stradichenko/PKB-theme/raw/main/config/_default/params.toml

# just to make sure the the theme was imported 
hugo mod graph
# > github.com/<your-username>/<your-blog> github.com/stradichenko/PKB-theme@v0.0.1

# test blog with drafts
rm -rf .cache/hugo/ resources/ public/ tmp/ .hugo_build.lock && hugo server --source . --noHTTPCache --renderToMemory --disableFastRender --ignoreCache --gc --logLevel debug -D -e development

```

The easiest way to keep the module updated while allowing you to populate the theme with your preferences is to copy the params (or any other personalized files) from the theme into their site’s own archetypes/ directory. Since Hugo gives precedence to local files over module files, any customizations (such as personal profile information) remain in place even if the theme updates.

### As Git submodule

```bash
hugo new site <YOURWEBSITENAME>
cd <YOURWEBSITENAME>
git init
git submodule add https://github.com/stradichenko/PKB-theme.git themes/PKB-theme
echo "theme = 'PKB-theme'" >> hugo.toml
```

---

## Getting Started
Inside your <YOURWEBSITENAME> folder you can always use the command `hugo server` and check it with [localhost:1313](http://localhost:1313/) in the address bar of your browser. The hugo server command starts a local development server that watches for changes in your files and automatically regenerates the site and refreshes the browser. This is useful for live previewing changes as you develop your site. Press `CTRL + <C>` to stop Hugo’s development server.

## Configure your site
Described at [documentation](https://github.com/stradichenko/PKB-theme/blob/main/documentation), these are the initial steps to understand how you can customize your blog to your liking.

## Publising site
By default, running the command `hugo` will generate the static files for your website from your content and templates. The generated files will be placed in the `public` directory (or another specified output directory).

## Installation Flowchart

## FAQ
## [You don't have a starting site built in HUGO](#creating-a-new-hugo-site)
## [What are the differences of the different methods of installation?](#key-differences-in-installation-methods)

### Creating a new HUGO site
You can start by: 
```bash
hugo new site <your-site-name>
cd <your-site-name>
```
Tipically the options would be to create a new theme with the command `hugo new theme <THEMENAME>`. Or, install a theme from https://themes.gohugo.io/. But in this case the installation will come from the instructions above this repo.

---

### Key Differences in installation methods
When you install a theme as a Hugo module, Hugo manages the theme as a dependency rather than copying its files directly into your project's `themes/` folder. You’re telling Hugo to treat your project as a module. In practical terms, this command creates a `go.mod` file in your project’s root directory. This file is a key component of Go’s module system and serves as a manifest that lets Hugo manage dependencies (like themes or other modules) and control versioning. Without running this initialization, Hugo wouldn’t know to look for or handle module-based imports in your project.
- **Module Cache:** Hugo Modules are managed through Go's module system, which downloads and stores the theme in an internal module cache. The files remain there and are referenced during the build process.
- **Separation of Dependencies:** Unlike Git submodules, which add a physical copy of the theme into your repository (typically under themes/), Hugo Modules keep the dependency separate. This helps with cleaner project management and easier updates.
- **On-Demand Access:** The theme files are automatically fetched and used when you build your site. You don’t need a local copy in your themes/ folder for Hugo to incorporate them.

When you run hugo mod init,

| Method | Pros | Cons |
|--------|------|------|
| **Hugo Module** | Easier dependency management, automatic updates, no need to track theme files in your project. | Requires Hugo Modules (Go-based). |
| **Git Submodule** | Works well with Git workflows, allows manual control of theme updates. | More manual updates, extra Git commands needed. |

If you’re using **Hugo Modules**, you can just run:  
```sh
hugo mod get -u github.com/stradichenko/PKB-theme
cat go.mod | grep "github.com/stradichenko/PKB-theme"
```
to update the theme.  If you ever need to see a local copy of all module files, you can use the command `hugo mod vendor`.

which will copy all module dependencies into a vendor/ folder.

If you’re using **Git submodules**, you need to run:  
```sh
git submodule update --remote --merge
```
to fetch the latest theme updates.

### Hugo's Theme Configuration Inheritance

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
# If using Hugo Modules:
hugo mod vendor
cp vendor/github.com/stradichenko/PKB-theme/layouts/partials/footer.html layouts/partials/

# If using Git submodule:
cp themes/PKB-theme/layouts/partials/footer.html layouts/partials/
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

