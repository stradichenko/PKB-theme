---
title: "Gallery Slider Documentation"
author: "PKB Theme"
date: 2025-07-03T10:20:24+02:00
lastmod: 2025-07-03T10:20:24+02:00
draft: false
description: "Complete guide to using the gallery slider component with examples and customization options"
comments: false
series: []
tags: ["gallery", "slider", "images", "components", "documentation"]
categories: ["documentation", "components"]
slug: "gallery-slider"
toc: true
sidenotes: true
image: "images/docs/gallery-slider-doc/gallery-preview.jpg"
---

The Gallery Slider component provides an elegant way to display multiple images with navigation controls, thumbnails, and captions. This guide covers everything from basic usage to advanced customization.

## File Organization for Images

Understanding how to organize your images is crucial for effective gallery management:

```
Hugo Site Structure
├── static/
│   └── images/
│       ├── docs/
│       │   └── gallery-slider-doc/
│       │       ├── landscape-1.jpg
│       │       ├── landscape-2.jpg
│       │       ├── portrait-1.jpg
│       │       └── thumb-landscape-1.jpg  ← Optional thumbnails
│       ├── gallery/
│       │   ├── nature/
│       │   │   ├── forest-1.jpg
│       │   │   └── forest-2.jpg
│       │   └── architecture/
│       │       ├── building-1.jpg
│       │       └── building-2.jpg
│       └── posts/
│           └── my-post/
│               ├── hero.jpg
│               └── detail.jpg
├── content/
│   └── posts/
│       └── my-gallery-post.md  ← Your content file
└── layouts/
    └── partials/
        └── gallery-slider.html  ← Component template
```

{{< sidenote >}}
**Organization Tips**: Group images by topic or post in subdirectories. Use consistent naming conventions like `image-name.jpg` and optional `thumb-image-name.jpg` for custom thumbnails.
{{< /sidenote >}}

### URL Structure

- **Local images**: `/images/docs/gallery-slider-doc/landscape-1.jpg`
- **Web images**: `https://example.com/image.jpg`
- **Relative paths**: Always start with `/` for Hugo static files

## Basic Gallery Usage

### Simple Image Gallery

Here's a basic gallery with local images:

{{< gallery-slider 
  id="basic-gallery"
  src1="/images/docs/gallery-slider-doc/helenium-8985687_1280.jpg"
  alt1="Beautiful landscape view"
  caption1="Mountain landscape at sunrise"
  src2="/images/docs/gallery-slider-doc/karsten-winegeart-AW76trwVU08-unsplash.jpg"
  alt2="Another landscape"
  caption2="Forest path in autumn"
  src3="/images/docs/gallery-slider-doc/nataliya-melnychuk-V5s-XShdujI-unsplash.jpg"
  alt3="Portrait orientation"
  caption3="Vertical composition example"
>}}

**Code:**
We replaced `{{` with `{{ "{{" }}` and `}}` with `{{ "}}" }}` so this code were visible; the actual segment starts with... `{{` `<`, no space.

```html
{{ "{{" }}< gallery-slider 
  id="basic-gallery"
  src1="/images/docs/gallery-slider-doc/helenium-8985687_1280.jpg"
  alt1="Beautiful landscape view"
  caption1="Mountain landscape at sunrise"
  src2="/images/docs/gallery-slider-doc/karsten-winegeart-AW76trwVU08-unsplash.jpg"
  alt2="Another landscape"
  caption2="Forest path in autumn"
  src3="/images/docs/gallery-slider-doc/nataliya-melnychuk-V5s-XShdujI-unsplash.jpg"
  alt3="Portrait orientation"
  caption3="Vertical composition example"
{{ "}}" }}
```


## Web Images Gallery

You can also use images from external sources:

{{< gallery-slider 
  id="web-gallery"
  src1="https://picsum.photos/800/600?random=1"
  alt1="Random image 1"
  caption1="Beautiful random landscape from Lorem Picsum"
  src2="https://picsum.photos/800/600?random=2"
  alt2="Random image 2"
  caption2="Another stunning view"
  src3="https://picsum.photos/600/800?random=3"
  alt3="Random image 3"
  caption3="Portrait orientation example"
>}}

**Code:**
```html
{{ "{{" }}< gallery-slider 
  id="web-gallery"
  src1="https://picsum.photos/800/600?random=1"
  alt1="Random image 1"
  caption1="Beautiful random landscape"
  src2="https://picsum.photos/800/600?random=2"
  alt2="Random image 2"
  caption2="Another stunning view"
  src3="https://picsum.photos/600/800?random=3"
  alt3="Random image 3"
  caption3="Portrait orientation example"
{{ "}}" }}
```

{{< sidenote >}}
**Performance Note**: External images may load slower than local images. Consider downloading important images to your static folder for better performance and reliability.
{{< /sidenote >}}

## Gallery with Custom Thumbnails

For better performance and control, you can specify custom thumbnail images:

{{< gallery-slider 
  id="thumbnail-gallery"
  showThumbnails="true"
  src1="/images/docs/gallery-slider-doc/street-food-9587641_1280.png"
  thumb1="/images/docs/gallery-slider-doc/helenium-8985687_1280.jpg"
  alt1="Landscape with custom thumb"
  caption1="Custom thumbnail example"
  src2="/images/docs/gallery-slider-doc/vadim-sadovski-rvkk2qqfE4M-unsplash.jpg"
  alt2="Auto-generated thumbnail"
  caption2="Auto-generated thumbnail (uses main image)"
>}}

**Code:**
```html
{{ "{{" }}< gallery-slider 
  id="thumbnail-gallery"
  showThumbnails="true"
  src1="/images/docs/gallery-slider-doc/street-food-9587641_1280.png"
  thumb1="/images/docs/gallery-slider-doc/helenium-8985687_1280.jpg"
  alt1="Landscape with custom thumb"
  caption1="Custom thumbnail example"
  src2="/images/docs/gallery-slider-doc/vadim-sadovski-rvkk2qqfE4M-unsplash.jpg"
  alt2="Auto-generated thumbnail"
  caption2="Auto-generated thumbnail (uses main image)"
{{ "}}" }}
```

## Autoplay Gallery

Create a self-advancing slideshow:

{{< gallery-slider 
  id="autoplay-gallery"
  autoplay="true"
  interval="3000"
  showThumbnails="false"
  src1="/images/docs/gallery-slider-doc/helenium-8985687_1280.jpg"
  alt1="Auto slide 1"
  caption1="Autoplay every 3 seconds"
  src2="/images/docs/gallery-slider-doc/karsten-winegeart-AW76trwVU08-unsplash.jpg"
  alt2="Auto slide 2"
  caption2="Hover to pause autoplay"
  src3="/images/docs/gallery-slider-doc/nataliya-melnychuk-V5s-XShdujI-unsplash.jpg"
  alt3="Auto slide 3"
  caption3="Click navigation to restart timer"
>}}

**Code:**
```html
{{ "{{" }}< gallery-slider 
  id="autoplay-gallery"
  autoplay="true"
  interval="3000"
  showThumbnails="false"
  src1="/images/docs/gallery-slider-doc/helenium-8985687_1280.jpg"
  alt1="Auto slide 1"
  caption1="Autoplay every 3 seconds"
  src2="/images/docs/gallery-slider-doc/pawel-czerwinski-mrCMyoadfBM-unsplash.jpg"
  alt2="Auto slide 2"
  caption2="Hover to pause autoplay"
  src3="/images/docs/gallery-slider-doc/nataliya-melnychuk-V5s-XShdujI-unsplash.jpg"
  alt3="Auto slide 3"
  caption3="Click navigation to restart timer"
{{ "}}" }}
```

## Minimal Gallery (No Thumbnails)

For a cleaner look without thumbnail navigation:

{{< gallery-slider 
  id="minimal-gallery"
  showThumbnails="false"
  src1="/images/docs/gallery-slider-doc/plums-8932336_1280.jpg"
  alt1="Minimal slide 1"
  caption1="Clean, minimal interface"
  src2="/images/docs/gallery-slider-doc/spenser-sembrat-esoj35vCKS8-unsplash.jpg"
  alt2="Minimal slide 2"
  caption2="Focus on the images"
  src3="/images/docs/gallery-slider-doc/vadim-sadovski-rvkk2qqfE4M-unsplash.jpg"
  alt3="Minimal slide 3"
  caption3="Navigation via arrows and dots only"
>}}

**Code:**
```html
{{ "{{" }}< gallery-slider 
  id="minimal-gallery"
  showThumbnails="false"
  src1="/images/docs/gallery-slider-doc/plums-8932336_1280.jpg"
  alt1="Minimal slide 1"
  caption1="Clean, minimal interface"
  src2="/images/docs/gallery-slider-doc/pawel-czerwinski-mrCMyoadfBM-unsplash.jpg"
  alt2="Minimal slide 2"
  caption2="Focus on the images"
  src3="/images/docs/gallery-slider-doc/vadim-sadovski-rvkk2qqfE4M-unsplash.jpg"
  alt3="Minimal slide 3"
  caption3="Navigation via arrows and dots only"
{{ "}}" }}
```

## Gallery Configuration Options

### Main Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | "gallery" | Unique identifier for the gallery |
| `autoplay` | boolean | false | Enable automatic slideshow |
| `interval` | number | 5000 | Autoplay interval in milliseconds |
| `showThumbnails` | boolean | true | Display thumbnail navigation |

### Image Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `src` | string | ✓ | Main image URL (local or external) |
| `alt` | string | ✓ | Alternative text for accessibility |
| `caption` | string | ✗ | Text displayed below image |
| `thumb` | string | ✗ | Custom thumbnail URL (optional) |

{{< sidenote >}}
**Accessibility**: Always provide meaningful `alt` text for screen readers. Captions are optional but enhance user experience by providing context.
{{< /sidenote >}}

## Advanced Usage Examples

### Mixed Content Gallery

### Portfolio Gallery with Detailed Captions

{{< gallery-slider 
  id="portfolio-gallery"
  autoplay=false
  showThumbnails=true
  interval=4000
  src1="/images/docs/gallery-slider-doc/street-food-9587641_1280.png"
  alt1="Project Alpha"
  caption1="**Project Alpha** - Modern web application built with Hugo and JavaScript. *Click arrows to navigate.*"
  src2="/images/docs/gallery-slider-doc/vadim-sadovski-rvkk2qqfE4M-unsplash.jpg"
  alt2="Project Beta"
  caption2="**Project Beta** - Responsive design system with custom components. *Supports markdown in captions.*"
  src3="/images/docs/gallery-slider-doc/pawel-czerwinski-mrCMyoadfBM-unsplash.jpg"
  alt3="Project Gamma"
  caption3="**Project Gamma** - Mobile-first approach with progressive enhancement."
>}}

## CSS Customization Variables

The gallery slider uses CSS custom properties for easy theming:

## Best Practices

### Image Optimization
- **File size**: Keep images under 500KB for web delivery
- **Dimensions**: Use consistent aspect ratios when possible
- **Format**: Use WebP or JPEG for photos, PNG for graphics with transparency
- **Thumbnails**: Create 80x80px thumbnails for better performance

### Accessibility
- Always provide descriptive `alt` text
- Use semantic HTML structure (maintained by the component)
- Ensure keyboard navigation works (arrow keys supported)
- Test with screen readers

### Performance
- Lazy load images not currently visible (built into component)
- Use local images when possible for faster loading
- Consider CDN for external images
- Optimize thumbnail sizes

### User Experience
- Keep captions concise but informative
- Use autoplay sparingly (can be distracting)
- Provide multiple navigation methods (arrows, dots, thumbnails)
- Test on mobile devices for touch interactions

{{< sidenote >}}
**Mobile Considerations**: The gallery automatically hides thumbnails on small screens and adjusts navigation elements for touch interfaces. Test your galleries on various device sizes.
{{< /sidenote >}}

## Troubleshooting

### Images Not Loading
1. Check file paths are correct and start with `/` for local images
2. Verify images exist in the `static/` folder
3. Ensure external image URLs are accessible
4. Check browser console for 404 errors

### Gallery Not Functioning
1. Verify unique `id` for each gallery on the same page
2. Check JSON syntax in the `images` parameter
3. Ensure JavaScript is enabled in browser
4. Look for console errors

### Styling Issues
1. Check CSS custom properties are defined
2. Verify theme compatibility
3. Test in different browsers
4. Clear browser cache after CSS changes

## Integration with Hugo

The gallery slider integrates seamlessly with Hugo's content management:

```markdown
---
title: "My Gallery Post"
gallery_images:
  - src: "/images/gallery/image1.jpg"
    alt: "Description 1"
    caption: "Caption 1"
  - src: "/images/gallery/image2.jpg"
    alt: "Description 2"
    caption: "Caption 2"
---

# My Post with Gallery

{{< gallery-slider id="post-gallery" images=.Params.gallery_images >}}

More content here...
```

This approach allows you to define gallery images in frontmatter and reference them in your content, making management easier for large galleries.
```

This approach allows you to define gallery images in frontmatter and reference them in your content, making management easier for large galleries.
