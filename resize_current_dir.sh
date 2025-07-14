#!/bin/bash

# Resize ảnh trong thư mục hiện tại
echo "🔍 Resize ảnh trong thư mục hiện tại..."

# Backup
mkdir -p backup_current
cp Power_01.png Power_02.png Datacenter.png Connectivity_01.png Connection_animation.png Connectivity_02.png location_01.png location_02.png backup_current/ 2>/dev/null

# Resize
for file in Power_01.png Power_02.png Datacenter.png Connectivity_01.png Connection_animation.png Connectivity_02.png location_01.png location_02.png; do
    if [ -f "$file" ]; then
        echo "📸 Resizing $file..."
        sips -Z 1920 "$file"
    fi
done

echo "✅ Done!"
