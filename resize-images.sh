#!/bin/bash

# Script để resize các ảnh lớn xuống dưới 2000x2000 pixels
# Yêu cầu: Cài đặt ImageMagick (brew install imagemagick)

echo "🔍 Đang kiểm tra và resize các ảnh lớn..."

# Đường dẫn đến thư mục chứa ảnh
IMAGE_DIR="./hue-datacenter-visualization/public/images"
BACKUP_DIR="./hue-datacenter-visualization/public/images/backup"

# Tạo thư mục backup nếu chưa có
mkdir -p "$BACKUP_DIR"

# Danh sách các file cần resize
LARGE_FILES=(
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

# Function để resize ảnh
resize_image() {
    local file=$1
    local filepath="$IMAGE_DIR/$file"
    local backup_path="$BACKUP_DIR/$file"
    
    if [ -f "$filepath" ]; then
        echo "📸 Processing: $file"
        
        # Backup file gốc
        cp "$filepath" "$backup_path"
        echo "   ✅ Backed up to: $backup_path"
        
        # Resize ảnh - giữ tỉ lệ, max dimension là 1920px
        convert "$filepath" -resize "1920x1920>" "$filepath"
        
        # Optimize PNG
        # optipng -o2 "$filepath" 2>/dev/null || true
        
        # Hiển thị kích thước mới
        new_size=$(du -h "$filepath" | cut -f1)
        echo "   ✅ Resized to: $new_size"
    else
        echo "   ⚠️  File not found: $file"
    fi
}

# Kiểm tra ImageMagick đã cài chưa
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick chưa được cài đặt!"
    echo "📦 Vui lòng cài đặt bằng lệnh: brew install imagemagick"
    exit 1
fi

# Resize từng file
for file in "${LARGE_FILES[@]}"; do
    resize_image "$file"
done

echo ""
echo "✅ Hoàn thành resize ảnh!"
echo "📁 File gốc đã được backup tại: $BACKUP_DIR"
echo ""
echo "🔧 Các bước tiếp theo:"
echo "1. Kiểm tra các ảnh đã resize trong $IMAGE_DIR"
echo "2. Test lại ứng dụng để đảm bảo ảnh hiển thị đúng"
echo "3. Commit và push changes"
