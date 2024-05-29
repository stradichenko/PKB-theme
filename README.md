# PKM-theme
This is the supplementary theme meant for the [CMS-PKM-Blogger project](https://github.com/Stradichenko/PKM-Blogger/tree/main). This template is meant for a blog oriented towards a [Personal Knowledge Management (PKM)](https://www.wikiwand.com/en/Personal_knowledge_management). 

## Installation
Make sure to have [HUGO](https://gohugo.io/installation/) and [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

### As a Hugo Module (recommended)
From your project's root directory, initiate the hugo module system and add the theme's repo to your config.toml
```bash
hugo mod init github.com/<your_user>/<your_project>
echo "theme = ["github.com/Stradichenko/PKM-theme"]" >> config.toml
```

### As Git submodule
```bash
hugo new site <YOURWEBSITENAME>
cd <YOURWEBSITENAME> # go inside the folder of your PKM
git init
git submodule add https://github.com/Stradichenko/PKM-theme.git themes/PKM-theme
echo "theme = 'PKM-theme'" >> hugo.toml
```

View your site at the URL displayed in your terminal. 

## Getting Started
Inside your <YOURWEBSITENAME> folder you can always use the command `hugo server` and check it with localhost:1313 in the address bar of your browser. The hugo server command starts a local development server that watches for changes in your files and automatically regenerates the site and refreshes the browser. This is useful for live previewing changes as you develop your site. Press Ctrl + C to stop Hugo’s development server.

## Configure your site

## Publising site
By default, running the command `hugo` will generate the static files for your website from your content and templates. The generated files will be placed in the `public` directory (or another specified output directory).
