const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Image optimization pipeline for Hugo theme
 */
class ImageOptimizer {
  constructor() {
    this.sourceDir = './assets/images';
    this.outputDir = './static/images';
    this.formats = ['webp', 'jpeg'];
    this.sizes = [320, 640, 768, 1024, 1200, 1920];
    this.quality = {
      webp: 85,
      jpeg: 90,
      png: 90
    };
  }

  async optimize() {
    console.log('🖼️  Starting image optimization...');
    
    try {
      await this.ensureDirectories();
      const images = await this.findImages();
      
      for (const imagePath of images) {
        await this.processImage(imagePath);
      }
      
      console.log(`✅ Optimized ${images.length} images`);
    } catch (error) {
      console.error('❌ Image optimization failed:', error);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async findImages() {
    const pattern = path.join(this.sourceDir, '**/*.{jpg,jpeg,png,webp}');
    return glob.sync(pattern);
  }

  async processImage(imagePath) {
    const fileName = path.basename(imagePath, path.extname(imagePath));
    const relativePath = path.relative(this.sourceDir, imagePath);
    const outputBase = path.join(this.outputDir, path.dirname(relativePath), fileName);
    
    console.log(`📸 Processing: ${relativePath}`);
    
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Generate responsive variants
      for (const width of this.sizes) {
        if (width <= metadata.width) {
          await this.generateVariant(image, outputBase, width);
        }
      }
      
      // Generate original size if not already covered
      if (!this.sizes.includes(metadata.width)) {
        await this.generateVariant(image, outputBase, metadata.width);
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${imagePath}:`, error);
    }
  }

  async generateVariant(image, outputBase, width) {
    const resized = image.resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside'
    });
    
    // Generate WebP
    await resized
      .webp({ quality: this.quality.webp })
      .toFile(`${outputBase}-${width}w.webp`);
    
    // Generate JPEG fallback
    await resized
      .jpeg({ quality: this.quality.jpeg, progressive: true })
      .toFile(`${outputBase}-${width}w.jpg`);
  }
}

// Run the optimizer
const optimizer = new ImageOptimizer();
optimizer.optimize();
