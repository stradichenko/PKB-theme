{
  // Replaces dashes in the file name with spaces and converts it to title case
  "title": "{{ replace .File.ContentBaseName `-` ` ` | title }}",
  // The "draft" field is set to true by default to indicate that new content is unpublished.
  "draft": true,
  "publishDate": "", // Expected format: YYYY-MM-DD
  "lastmod": "",
  "expiryDate": "",
  "description": "",
  "keywords": [],
  "author": {
    "name": "",
    "email": "",
    "bio": ""
  },
  "categories": [],
  "tags": [],
  "slug": "",
  "url": "",
  "type": "",
  "layout": "",
  "aliases": [],
  // Defines the main menu entry for this content
  "menu": {
    "main": {
      // Determines the order of menu items; lower values appear first
      "weight": 0,
      "identifier": "",
      "url": ""
    }
  },
  "images": [],
  "featured": "",
  "resources": {
    "thumbnail": "",
    "gallery": []
  },
  "params": {
    "customField1": "",
    "customField2": "",
    "customList": []
  },
  "toc": true,
  "sidenotes": true,
  "weight": 0,
  "summary": "",
  "readTime": 0,
  // Indicates whether comments are enabled for the content
  "comments": false
}

