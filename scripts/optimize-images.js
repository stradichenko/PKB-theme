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
    this.processed = 0;
    this.errors = 0;
    this.startTime = Date.now();
  }

  async optimize() {
    console.log('🖼️  Starting image optimization...');
    
    try {
      await this.ensureDirectories();
      const images = await this.findImages();
      
      if (images.length === 0) {
        console.log('📷 No images found to optimize');
        return;
      }
      
      console.log(`📷 Found ${images.length} images to process`);
      
      // Process images with concurrency control
      const concurrency = 3; // Limit concurrent processing
      for (let i = 0; i < images.length; i += concurrency) {
        const batch = images.slice(i, i + concurrency);
        await Promise.all(
          batch.map(imagePath => this.processImageSafely(imagePath))
        );
        
        // Progress update
        const progress = Math.min(i + concurrency, images.length);
        console.log(`📈 Progress: ${progress}/${images.length} images processed`);
      }
      
      const duration = (Date.now() - this.startTime) / 1000;
      console.log(`✅ Optimization complete!`);
      console.log(`📊 Statistics:`);
      console.log(`   - Total images: ${images.length}`);
      console.log(`   - Successfully processed: ${this.processed}`);
      console.log(`   - Errors: ${this.errors}`);
      console.log(`   - Duration: ${duration.toFixed(2)}s`);
      
    } catch (error) {
      console.error('❌ Image optimization failed:', error);
      process.exit(1);
    }
  }

  async processImageSafely(imagePath) {
    try {
      await this.processImage(imagePath);
      this.processed++;
    } catch (error) {
      this.errors++;
      console.error(`❌ Failed to process ${imagePath}:`, error.message);
    }
  }

  async processImage(imagePath) {
    const fileName = path.basename(imagePath, path.extname(imagePath));
    const relativePath = path.relative(this.sourceDir, imagePath);
    const outputBase = path.join(this.outputDir, path.dirname(relativePath), fileName);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputBase);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`📸 Processing: ${relativePath}`);
    
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Skip if image is too small
    if (metadata.width < 100 || metadata.height < 100) {
      console.log(`⚠️  Skipping small image: ${relativePath} (${metadata.width}x${metadata.height})`);
      return;
    }
    
    // Generate responsive variants
    const sizesToGenerate = this.sizes.filter(width => width <= metadata.width);
    
    // Always include original size if not in sizes array
    if (!sizesToGenerate.includes(metadata.width)) {
      sizesToGenerate.push(metadata.width);
    }
    
    for (const width of sizesToGenerate) {
      await this.generateVariant(image, outputBase, width);
    }
  }

  async generateVariant(image, outputBase, width) {
    const resized = image.resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside'
    });
    
    // Generate WebP with error handling
    try {
      await resized
        .webp({ 
          quality: this.quality.webp,
          effort: 4 // Balance between compression and speed
        })
        .toFile(`${outputBase}-${width}w.webp`);
    } catch (error) {
      console.warn(`⚠️  WebP generation failed for ${outputBase}-${width}w: ${error.message}`);
    }
    
    // Generate JPEG fallback with error handling
    try {
      await resized
        .jpeg({ 
          quality: this.quality.jpeg, 
          progressive: true,
          mozjpeg: true // Better compression
        })
        .toFile(`${outputBase}-${width}w.jpg`);
    } catch (error) {
      console.warn(`⚠️  JPEG generation failed for ${outputBase}-${width}w: ${error.message}`);
    }
  }
}

// Run the optimizer
const optimizer = new ImageOptimizer();
optimizer.optimize();
