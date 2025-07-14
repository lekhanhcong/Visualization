#!/bin/bash

# Script resize ảnh cho macOS sử dụng sips
cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation/hue-datacenter-visualization/public/images

echo "🔍 Bắt đầu resize ảnh..."
echo "========================"

# Backup và resize từng file
for file in Power.png Power_01.png Power_02.png Power_2N1.PNG Datacenter.png Connectivity_01.png Connectivity_02.png location_01.png location_02.png; do
    if [ -f "$file" ]; then
        echo ""
        echo "📸 Processing: $file"
        
        # Backup
        cp "$file" "backup/$file"
        echo "   ✅ Backed up"
        
        # Get dimensions
        dims=$(sips -g pixelHeight -g pixelWidth "$file" 2>/dev/null | tail -2)
        echo "   Original: $dims"
        
        # Resize
        sips -Z 1920 "$file" >/dev/null 2>&1
        
        # Show new dimensions  
        new_dims=$(sips -g pixelHeight -g pixelWidth "$file" 2>/dev/null | tail -2)
        echo "   Resized: $new_dims"
    fi
done

echo ""
echo "========================"
echo "✅ Hoàn thành resize!"
echo "📁 File gốc đã backup trong thư mục: backup/"
