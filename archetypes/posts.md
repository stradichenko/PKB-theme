---
title: "{{ replace .Name "-" " " | title }}"
author: "{{ site.Params.contact.profileName }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
description: "" # Brief summary of the post.
comments: true   # Enable Remark42 comments by default for posts
series: []
# for more control:
#   name:
#   part:
#   total:
tags: ["uncategorized"]
categories: ["general"]
keywords: []
slug: "{{ .Name | urlize }}"
toc: true
sidenotes: true
showReadingTime: true
showShareButtons: true
image: "images/{{ .Type }}/{{ .Name | urlize }}/{{ .Name | urlize }}.jpg" # make sure that the name corresponds to jpg, jpeg, png, etc.
alt: "" # Alt text for the header image (accessibility)
---

Add your post content here...
