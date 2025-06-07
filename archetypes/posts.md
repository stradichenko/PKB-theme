---
title: "{{ replace .Name "-" " " | title }}"
author: "Your Name"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
description: "blank_description" # Brief summary of the post.
comments: false  # Enable Remark42 comments by default
tags: []
categories: []
slug: "{{ .Name | urlize }}"
aliases: []
toc: true
sidenotes: true
image: "images/{{ .Name | urlize }}.jpg"
---

Add your post content here...
