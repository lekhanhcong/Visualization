const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const IMAGE_DIR = './hue-datacenter-visualization/public/images';
const BACKUP_DIR = './hue-datacenter-visualization/public/images/backup';
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

// List of files to resize
const LARGE_FILES = [
    'Power.png',
    'Power_01.png',
    'Power_02.png',
    'Power_2N1.PNG',
    'Datacenter.png',
    'Connectivity_01.png',
    'Connectivity_02.png',
    'location_01.png',
    'location_02.png'
];

async function getFileSizeMB(filepath) {
    const stats = await fs.stat(filepath);
    return stats.size / (1024 * 1024);
}

async function resizeImage(filename) {
    const filepath = path.join(IMAGE_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);
    
    try {
        // Check if file exists
        await fs.access(filepath);
        
        // Get original size
        const originalSize = await getFileSizeMB(filepath);
        
        // Get image metadata
        const metadata = await sharp(filepath).metadata();
        
        console.log(`\n📸 Processing: ${filename}`);
        console.log(`   Original size: ${originalSize.toFixed(2)} MB`);
        console.log(`   Original dimensions: ${metadata.width}x${metadata.height}`);
        
        // Backup original file
        await fs.copyFile(filepath, backupPath);
        console.log(`   ✅ Backed up to: backup/${filename}`);
        
        // Check if resize is needed
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
            // Resize image
            await sharp(filepath)
                .resize(MAX_WIDTH, MAX_HEIGHT, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png({ 
                    compressionLevel: 9,
                    quality: 95
                })
                .toFile(filepath + '.tmp');
            
            // Replace original with resized
            await fs.rename(filepath + '.tmp', filepath);
            
            // Get new size
            const newSize = await getFileSizeMB(filepath);
            const newMetadata = await sharp(filepath).metadata();
            
            console.log(`   ✅ Resized to: ${newSize.toFixed(2)} MB`);
            console.log(`   ✅ New dimensions: ${newMetadata.width}x${newMetadata.height}`);
            console.log(`   💾 Saved: ${(originalSize - newSize).toFixed(2)} MB (${((1 - newSize/originalSize) * 100).toFixed(1)}% reduction)`);
        } else {
            console.log(`   ℹ️  No resize needed - dimensions within limit`);
        }
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Error processing ${filename}: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🔍 Image Resize Script (Node.js/Sharp)');
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`🎯 Target directory: ${IMAGE_DIR}`);
    console.log(`📏 Maximum size: ${MAX_WIDTH}x${MAX_HEIGHT} pixels`);
    console.log('='.repeat(50));
    
    try {
        // Create backup directory
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        
        // Process each file
        let successCount = 0;
        for (const filename of LARGE_FILES) {
            if (await resizeImage(filename)) {
                successCount++;
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log(`✅ Completed! Processed ${successCount}/${LARGE_FILES.length} files`);
        console.log(`📁 Original files backed up in: ${BACKUP_DIR}`);
        console.log('\n🔧 Next steps:');
        console.log('1. Check the resized images in your app');
        console.log('2. If everything looks good, commit the changes');
        console.log('3. You can delete the backup folder later if needed');
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Check if sharp is installed
try {
    require.resolve('sharp');
    main();
} catch (e) {
    console.log('❌ Sharp is not installed!');
    console.log('📦 Please install it first:');
    console.log('   cd hue-datacenter-visualization');
    console.log('   npm install sharp');
    console.log('\nThen run this script again:');
    console.log('   node ../resize_images.js');
}
