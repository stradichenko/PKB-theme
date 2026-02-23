const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

/**
 * Generate enhanced XML sitemap for Hugo site
 */
class SitemapGenerator {
  constructor() {
    this.baseURL = process.env.HUGO_BASEURL || 'https://yoursite.com';
    this.publicDir = './public';
    this.contentDir = './content';
    this.urls = [];
  }

  async generate() {
    console.log('🗺️  Generating enhanced sitemap...');
    
    try {
      await this.scanContent();
      await this.generateXML();
      console.log(`✅ Sitemap generated with ${this.urls.length} URLs`);
    } catch (error) {
      console.error('❌ Sitemap generation failed:', error);
      process.exit(1);
    }
  }

  async scanContent() {
    // Get all HTML files from public directory
    const htmlFiles = globSync('**/*.html', { 
      cwd: this.publicDir,
      ignore: ['404.html', '**/amp/**']
    });

    for (const file of htmlFiles) {
      const url = this.fileToURL(file);
      const priority = this.calculatePriority(file);
      const changefreq = this.getChangeFreq(file);
      const lastmod = await this.getLastModified(file);

      this.urls.push({
        loc: url,
        lastmod,
        changefreq,
        priority
      });
    }

    // Sort by priority (descending) then by URL
    this.urls.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.loc.localeCompare(b.loc);
    });
  }

  fileToURL(file) {
    let url = file.replace(/index\.html$/, '').replace(/\.html$/, '/');
    if (!url.startsWith('/')) url = '/' + url;
    if (url !== '/' && url.endsWith('/')) url = url.slice(0, -1);
    return this.baseURL + url;
  }

  calculatePriority(file) {
    // Homepage gets highest priority
    if (file === 'index.html') return 1.0;
    
    // Main sections
    if (file.match(/^(posts|docs|about)\/index\.html$/)) return 0.9;
    
    // Recent posts (check if file was modified recently)
    if (file.startsWith('posts/') && this.isRecentFile(file)) return 0.8;
    
    // Other posts
    if (file.startsWith('posts/')) return 0.7;
    
    // Docs pages
    if (file.startsWith('docs/')) return 0.8;
    
    // Category and tag pages
    if (file.startsWith('categories/') || file.startsWith('tags/')) return 0.6;
    
    // Other pages
    return 0.5;
  }

  getChangeFreq(file) {
    if (file === 'index.html') return 'daily';
    if (file.startsWith('posts/')) return 'weekly';
    if (file.startsWith('docs/')) return 'monthly';
    if (file.startsWith('categories/') || file.startsWith('tags/')) return 'weekly';
    return 'monthly';
  }

  async getLastModified(file) {
    try {
      const fullPath = path.join(this.publicDir, file);
      const stats = fs.statSync(fullPath);
      return stats.mtime.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  isRecentFile(file) {
    try {
      const fullPath = path.join(this.publicDir, file);
      const stats = fs.statSync(fullPath);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return stats.mtime > thirtyDaysAgo;
    } catch (error) {
      return false;
    }
  }

  async generateXML() {
    const xml = this.buildXML();
    const sitemapPath = path.join(this.publicDir, 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    
    // Also generate a robots.txt if it doesn't exist
    const robotsPath = path.join(this.publicDir, 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
      const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${this.baseURL}/sitemap.xml`;
      fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
    }
  }

  buildXML() {
    const urlEntries = this.urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }
}

// Run the generator
const generator = new SitemapGenerator();
generator.generate();
