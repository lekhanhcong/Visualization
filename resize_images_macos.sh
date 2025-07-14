#!/bin/bash

# Quick resize script using macOS built-in sips command
# No need to install additional tools!

echo "🔍 Đang resize ảnh sử dụng macOS sips command..."
echo "================================================"

# Directories
IMAGE_DIR="./hue-datacenter-visualization/public/images"
BACKUP_DIR="./hue-datacenter-visualization/public/images/backup"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Files to resize
files=(
    "Power.png"
    "Power_01.png"
    "Power_02.png"
    "Power_2N1.PNG"
    "Datacenter.png"
    "Connectivity_01.png"
    "Connectivity_02.png"
    "location_01.png"
    "location_02.png"
)

# Process each file
for file in "${files[@]}"; do
    filepath="$IMAGE_DIR/$file"
    backup_path="$BACKUP_DIR/$file"
    
    if [ -f "$filepath" ]; then
        echo ""
        echo "📸 Processing: $file"
        
        # Get original dimensions
        dimensions=$(sips -g pixelHeight -g pixelWidth "$filepath" | grep -E 'pixelHeight|pixelWidth' | awk '{print $2}')
        width=$(echo "$dimensions" | head -1)
        height=$(echo "$dimensions" | tail -1)
        echo "   Original: ${width}x${height}"
        
        # Backup
        cp "$filepath" "$backup_path"
        echo "   ✅ Backed up"
        
        # Resize if needed (max 1920 pixels)
        if [ "$width" -gt 1920 ] || [ "$height" -gt 1920 ]; then
            sips -Z 1920 "$filepath" > /dev/null 2>&1
            
            # Get new dimensions
            new_dimensions=$(sips -g pixelHeight -g pixelWidth "$filepath" | grep -E 'pixelHeight|pixelWidth' | awk '{print $2}')
            new_width=$(echo "$new_dimensions" | head -1)
            new_height=$(echo "$new_dimensions" | tail -1)
            echo "   ✅ Resized to: ${new_width}x${new_height}"
        else
            echo "   ℹ️  No resize needed"
        fi
    else
        echo "   ⚠️  File not found: $file"
    fi
done

echo ""
echo "================================================"
echo "✅ Hoàn thành!"
echo "📁 File gốc đã backup tại: $BACKUP_DIR"
echo ""
echo "🔧 Bước tiếp theo:"
echo "1. Kiểm tra ảnh trong app: cd hue-datacenter-visualization && npm run dev"
echo "2. Nếu OK, commit: git add . && git commit -m 'fix: resize images'"
