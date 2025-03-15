# PKB-theme
## About
This is the supplementary theme meant for the [CMS-PKB-Blogger project](https://github.com/Stradichenko/PKB-Blogger/tree/main). This template is meant for a blog oriented towards a [Personal Knowledge Management (PKB)](https://www.wikiwand.com/en/Personal_knowledge_base). The theme is inspired in some subjects of [Edward Tufte's work](https://edwardtufte.github.io/tufte-css/), the PKB, and Gwerns' [blog design](https://gwern.net/design). 

## Installation
Make sure to have [HUGO](https://gohugo.io/installation/) and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

⚠️ We assume you have a HUGO site with the basics elements, otherwise read [FAQ](#faq).

### As a Hugo Module (recommended)
From your project's root directory, initiate the hugo module system and add the theme's repo to your `config.toml`. A [module](https://gohugo.io/hugo-modules/use-modules/#article) is a collection of related Go packages that are versioned together as a single unit. 

```bash
hugo mod init github.com/<your_user>/<your_project> # to initialize a new Hugo Module.
echo 'theme = ["github.com/Stradichenko/PKB-theme"]' >> config.toml
```

### As Git submodule

```bash
hugo new site <YOURWEBSITENAME>
cd <YOURWEBSITENAME> # go inside the folder of your PKB
git init
git submodule add https://github.com/Stradichenko/PKB-theme.git themes/PKB-theme
echo "theme = 'PKB-theme'" >> hugo.toml
```
## Getting Started
Inside your <YOURWEBSITENAME> folder you can always use the command `hugo server` and check it with [localhost:1313](http://localhost:1313/) in the address bar of your browser. The hugo server command starts a local development server that watches for changes in your files and automatically regenerates the site and refreshes the browser. This is useful for live previewing changes as you develop your site. Press Ctrl + C to stop Hugo’s development server.

## Configure your site
Described at [documentation](https://github.com/Stradichenko/PKB-theme/blob/main/documentation), these are the initial steps to understand how you can customize your blog to your liking.

## Publising site
By default, running the command `hugo` will generate the static files for your website from your content and templates. The generated files will be placed in the `public` directory (or another specified output directory).

## FAQ
## [You don't have a starting site built in HUGO](#creating-a-new-hugo-site)


### Creating a new HUGO site
You can start by: `hugo new site <your-site-name>`. Tipically the options would be to:

```bash
Create or install a theme:
   - Create a new theme with the command "hugo new theme <THEMENAME>"
   - Or, install a theme from https://themes.gohugo.io/
```
 But in this case the installation will come from the instructions above this repo.

