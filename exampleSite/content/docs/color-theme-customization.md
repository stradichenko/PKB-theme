---
title: "Color Theme Customization"
author: "Your Name"
date: 2025-06-16T14:46:21+02:00
lastmod: 2025-06-16T14:46:21+02:00
draft: true
description: "" # Brief summary of the post.
comments: false  # Enable Remark42 comments by default
series: []
# for more control:
#   name:
#   part:
#   total:
tags: ["color-theory"]
categories: ["docs"]
slug: "color-theme-customization"
toc: true
sidenotes: true
image: "images/color-theme-customization.jpg"
---

When customizing a theme, **readability** is achieved with a **contrasting color palette**.

This can be easily done by having a grayscaled theme with very different grades of Luminance (eg. black background, white letters (dark theme) or vice-versa (light theme)), end of the story. 

But if you want to add colors, the alternatives are more nuanced and myriad.

Firstly, make sure you have a local copy of the CSS variables:

```bash

mkdir -p assets/css/global/
curl -L -o assets/css/global/variables.css https://github.com/stradichenko/PKB-theme/raw/main/assets/css/global/variables.css
```

We suggest the following strategy:

Separate two contrast groups: A & B. 

Group A can be subdivided into three subgroups using `Triad`, `Split Complementary` or `Compound` Color Harmony in the `LAB` Color Mode:

For the `dark-theme`:

```
Applying the Compound Harmony and assigning each subgroup as analogous:

- Low luminance (A):
    - dark-primary & dark-secondary
    - dark-primary-variant
    - dark-background & dark-surface

Applying the Analogous Harmony

- High luminance (B):
    - dark-text-primary, dark-text-secondary & dark-border
```

For the `light-theme`:

```
- High luminance (A):
    - light-primary & light-secondary
    - light-primary-variant
    - light-background & light-surface

Applying the Analogous Harmony

- Low luminance (B):
    - light-text-primary, light-text-secondary & light-border
```

Toy with the color wheel; this will give us the base **hues**. Now, using this very useful [tool](https://oklch.com/) we could lock

In a tool that allows picking colors in a color wheel with different harmonies such as [this](https://color.adobe.com/create/color-wheel).


But to achieve this is good idea to select the proper color-space; TL;DR, we suggest using Oklab; 



## How do I pick my HUE

The initial approach we used, and the strategy to generate a amicable "palette". 
The minimal condition is that the text and the background are highly constrasting in Luminescance

https://grayscale.design/


Or you can just... do as you please, this site is your canvas.

```mermaid
graph TB
    %% Root Variables
    A[":root CSS Variables"] --> B["Light Theme Variables<br/>--light-primary: #4a90e2<br/>--light-background: #275f85<br/>--light-surface: #f8f8f8<br/>etc."]
    A --> C["Dark Theme Variables<br/>--dark-primary: #e9996b<br/>--dark-background: #1a202c<br/>--dark-surface: #1e2a38<br/>etc."]
    
    %% Current Theme Assignment
    B --> D["Current Theme Variables<br/>--color-primary<br/>--color-background<br/>--color-surface<br/>--color-text-primary<br/>etc."]
    C --> D
    
    %% Theme Toggle
    E["[data-theme='dark']<br/>CSS Selector"] --> F["Dark Theme Override<br/>Reassigns current theme<br/>variables to dark values"]
    F --> D
    
    %% Semantic Variables
    D --> G["Semantic Color Variables<br/>--text-color-heading<br/>--text-color-body<br/>--text-color-link<br/>--text-color-muted"]
    
    %% Component Variables
    D --> H["Component Variables<br/>--header-bg-color<br/>--footer-bg-color<br/>--dropdown-bg<br/>--scrollbar-thumb-bg"]
    
    %% Non-Color Systems
    A --> I["Typography System<br/>--font-family-sans<br/>--font-size-base<br/>--font-weight-normal"]
    A --> J["Spacing System<br/>--spacing-xs: 4px<br/>--spacing-md: 16px<br/>--spacing-xl: 36px"]
    A --> K["Layout Tokens<br/>--border-radius<br/>--shadow-light<br/>--z-index-modal"]
    
    %% Final Usage
    G --> L["CSS Classes<br/>.site-header<br/>.site-main<br/>.site-footer<br/>Component styles"]
    H --> L
    I --> L
    J --> L
    K --> L
    
    %% Theme Toggle Mechanism
    M["JavaScript Theme Toggle"] --> N["Sets data-theme attribute<br/>on document element"]
    N --> E
    
    %% Color Categories
    D --> O["8-Color Design System<br/>Primary, Secondary<br/>Background, Surface<br/>Text Primary/Secondary<br/>Border"]
    
    style A fill:#4a90e2,color:#fff
    style E fill:#e9996b,color:#fff
    style L fill:#48bb78,color:#fff
    style M fill:#ed8936,color:#fff
    style O fill:#8e44ad,color:#fff
```


Is a good idea to lose some Chroma to gain more Hue

--dark-secondary: #9A5B62
--dark-primary-variant: #BA97C4



1. Analogous base with low lightness
--dark-background: ;
--dark-surface: ; /* analogous and a bit higher in lumen */



Using a Square Color Harmony 
Complementary to base
- --dark-primary: 

Analogous but striking lightness compared to main
--

since --dark-primary-variant is mostly for highlighting links on hover, a reactive effect, a complementary color to --dark-primary is recommended.


Regarding -dark-text-secondary and --dark-border; anything low in luminescance and Chroma works well.


High Chroma is very opinionated
## Configuring the light theme


--light-background