#!/usr/bin/env python3
"""
Script to resize large images to maximum 1920x1920 pixels
Requires: pip install Pillow
"""

from PIL import Image
import os
import shutil
from datetime import datetime

# Configuration
IMAGE_DIR = "./hue-datacenter-visualization/public/images"
BACKUP_DIR = "./hue-datacenter-visualization/public/images/backup"
MAX_SIZE = (1920, 1920)

# List of files to resize
LARGE_FILES = [
    "Power.png",
    "Power_01.png",
    "Power_02.png",
    "Power_2N1.PNG",
    "Datacenter.png",
    "Connectivity_01.png",
    "Connectivity_02.png",
    "location_01.png",
    "location_02.png"
]

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def resize_image(filename):
    """Resize a single image"""
    filepath = os.path.join(IMAGE_DIR, filename)
    backup_path = os.path.join(BACKUP_DIR, filename)
    
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filename}")
        return False
    
    try:
        # Get original size
        original_size = get_file_size_mb(filepath)
        
        # Open image
        img = Image.open(filepath)
        original_dimensions = img.size
        
        print(f"\n📸 Processing: {filename}")
        print(f"   Original size: {original_size:.2f} MB")
        print(f"   Original dimensions: {original_dimensions[0]}x{original_dimensions[1]}")
        
        # Backup original file
        shutil.copy2(filepath, backup_path)
        print(f"   ✅ Backed up to: backup/{filename}")
        
        # Check if resize is needed
        if original_dimensions[0] > MAX_SIZE[0] or original_dimensions[1] > MAX_SIZE[1]:
            # Resize image maintaining aspect ratio
            img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            
            # Save with optimization
            if filename.lower().endswith('.png'):
                img.save(filepath, 'PNG', optimize=True)
            else:
                img.save(filepath, optimize=True, quality=95)
            
            # Get new size
            new_size = get_file_size_mb(filepath)
            new_img = Image.open(filepath)
            new_dimensions = new_img.size
            
            print(f"   ✅ Resized to: {new_size:.2f} MB")
            print(f"   ✅ New dimensions: {new_dimensions[0]}x{new_dimensions[1]}")
            print(f"   💾 Saved: {(original_size - new_size):.2f} MB ({((1 - new_size/original_size) * 100):.1f}% reduction)")
        else:
            print(f"   ℹ️  No resize needed - dimensions within limit")
            # Still optimize the file
            if filename.lower().endswith('.png'):
                img.save(filepath, 'PNG', optimize=True)
            else:
                img.save(filepath, optimize=True, quality=95)
            new_size = get_file_size_mb(filepath)
            if new_size < original_size:
                print(f"   ✅ Optimized to: {new_size:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error processing {filename}: {str(e)}")
        # Restore from backup if error
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, filepath)
        return False

def main():
    """Main function"""
    print("🔍 Image Resize Script")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🎯 Target directory: {IMAGE_DIR}")
    print(f"📏 Maximum size: {MAX_SIZE[0]}x{MAX_SIZE[1]} pixels")
    print("=" * 50)
    
    # Check if directories exist
    if not os.path.exists(IMAGE_DIR):
        print(f"❌ Image directory not found: {IMAGE_DIR}")
        return
    
    # Create backup directory if needed
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    # Process each file
    success_count = 0
    for filename in LARGE_FILES:
        if resize_image(filename):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Completed! Processed {success_count}/{len(LARGE_FILES)} files")
    print(f"📁 Original files backed up in: {BACKUP_DIR}")
    print("\n🔧 Next steps:")
    print("1. Check the resized images in your app")
    print("2. If everything looks good, commit the changes")
    print("3. You can delete the backup folder later if needed")

if __name__ == "__main__":
    main()
