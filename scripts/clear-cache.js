const fs = require('fs');
const path = require('path');

class CacheManager {
  constructor() {
    this.cacheDir = './resources/_gen';
    this.fragmentCacheDir = './resources/cache';
  }

  clearAllCache() {
    console.log('🧹 Clearing all Hugo caches...');
    
    this.clearDirectory(this.cacheDir);
    this.clearDirectory(this.fragmentCacheDir);
    
    console.log('✅ Cache cleared successfully');
  }

  clearFragmentCache() {
    console.log('🧹 Clearing fragment cache...');
    this.clearDirectory(path.join(this.fragmentCacheDir, 'fragments'));
    console.log('✅ Fragment cache cleared');
  }

  clearResourceCache() {
    console.log('🧹 Clearing resource cache...');
    this.clearDirectory(path.join(this.fragmentCacheDir, 'bundles'));
    console.log('✅ Resource cache cleared');
  }

  clearDirectory(dir) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  getStats() {
    const stats = {
      totalSize: 0,
      fileCount: 0
    };

    [this.cacheDir, this.fragmentCacheDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        this.calculateDirStats(dir, stats);
      }
    });

    return stats;
  }

  calculateDirStats(dir, stats) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        this.calculateDirStats(fullPath, stats);
      } else {
        const stat = fs.statSync(fullPath);
        stats.totalSize += stat.size;
        stats.fileCount++;
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const manager = new CacheManager();
  const command = process.argv[2];

  switch (command) {
    case 'clear':
      manager.clearAllCache();
      break;
    case 'clear-fragments':
      manager.clearFragmentCache();
      break;
    case 'clear-resources':
      manager.clearResourceCache();
      break;
    case 'stats':
      const stats = manager.getStats();
      console.log(`📊 Cache Stats:`);
      console.log(`   Files: ${stats.fileCount}`);
      console.log(`   Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      break;
    default:
      console.log('Usage: node clear-cache.js [clear|clear-fragments|clear-resources|stats]');
  }
}

module.exports = CacheManager;
