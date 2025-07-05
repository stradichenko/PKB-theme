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
---

Add your post content here...
