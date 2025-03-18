# PKB-theme
![CI Status](https://github.com/stradichenko/PKB-theme/actions/workflows/test.yml/badge.svg)
![GitHub License](https://img.shields.io/github/license/stradichenko/PKB-theme)
## About
This is the supplementary theme meant for the [CMS-PKB-Blogger project](https://github.com/stradichenko/PKB-Blogger/tree/main). This template is meant for a blog oriented towards a [Personal Knowledge Management (PKB)](https://www.wikiwand.com/en/Personal_knowledge_base). The theme is inspired in some subjects of [Edward Tufte's work](https://edwardtufte.github.io/tufte-css/), the PKB, and Gwerns' [blog design](https://gwern.net/design). 

## Installation
⚠️ For the most part of the instructions we assume that you are creating a site from scratch.

If you already have a populated HUGO site, make sure that this installation steps adjust to you context; check the [installation and customization flowchart](#installation-flowchart). For any other doubt, read the [FAQ](#faq).

Have [HUGO](https://gohugo.io/installation/) and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed in your system.

### As a Hugo Module (recommended)
From your project's root directory, initiate the hugo module system and add the theme's repo to your `config.toml`. A [module](https://gohugo.io/hugo-modules/use-modules/#article) is a collection of related Go packages that are versioned together as a single unit. 

```bash
# 1. Initialize HUGO module (use your actual repo or example.com paths)
hugo mod init github.com/yourname/your_project

# 2. Create config.toml with module config
cat <<EOF >> config.toml
[module]
  [[module.imports]]
    path = 'github.com/stradichenko/PKB-theme'
EOF

# 3. Download the theme
hugo mod get github.com/stradichenko/PKB-theme

# 4. This will use HUGO to Auto-create archetype for the user to customize
hugo new --kind default example.md && rm content/example.md
```
The easiest way to keep the module updated while allowing you to populate the theme with your preferences is to copy the archetype (or any other personalized files) from the theme into their site’s own archetypes/ directory. Since Hugo gives precedence to local files over module files, any customizations (such as personal profile information) remain in place even if the theme updates.
Since Hugo gives precedence to local files over module files, any customizations (such as personal profile information) remain in place even if the theme updates.

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

