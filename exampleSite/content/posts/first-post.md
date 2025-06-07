---
title: "First Post"
date: 2025-06-07T20:37:15+02:00
draft: true
comments: false  # Enable Remark42 comments by default
tags: []
categories: []
---

To create your first post, this is the CLI pattern:

```bash
hugo new content content/<archetype>/<post-name.md>
```

So for example, to create the post you are currently reading, the command followed the pathfile (which in this case implied the "post" archetype) and filename:

```bash
hugo new content content/posts/first-post.md
```

The filename is kebab-case which is automatically converted to `title: "First Post"`. 

To do proper stylization, you can follow the 