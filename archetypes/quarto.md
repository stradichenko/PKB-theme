---
title: "{{ replace .Name "-" " " | title }}"
author: "{{ site.Params.contact.profileName }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
description: "" # Brief summary of the post.
comments: false  # Enable Remark42 comments by default
series: []
# for more control:
#   name:
#   part:
#   total:
tags: []
categories: []
slug: "{{ .Name | urlize }}"
toc: true
sidenotes: true
image: "images/{{ .Type }}/{{ .Name | urlize }}/{{ .Name | urlize }}.jpg" # make sure that the name corresponds to jpg, jpeg, png, etc.
alt: "" # Alt text for the header image (accessibility)

format:
  html:                # Not really needed for this post
    code-fold: false   # Not really needed for this post
  hugo-md:
    code-fold: false
editor:                # Not really needed for this post
  render-on-save: true # Not really needed for this post
jupyter: python3
---