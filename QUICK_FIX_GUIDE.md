# 🚀 HƯỚNG DẪN RESIZE ẢNH - QUICK FIX

## Cách 1: Dùng macOS sips (Đơn giản nhất - Khuyến nghị)

```bash
cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation
chmod +x resize_images_macos.sh
./resize_images_macos.sh
```

Script này sử dụng `sips` - tool có sẵn trên macOS, không cần cài thêm gì!

## Cách 2: Dùng Python (Nếu đã có Python)

```bash
# Cài Pillow nếu chưa có
pip3 install Pillow

# Chạy script
python3 resize_images.py
```

## Cách 3: Dùng Node.js (Nếu muốn dùng với project)

```bash
cd hue-datacenter-visualization
npm install sharp
cd ..
node resize_images.js
```

## Cách 4: Resize thủ công nhanh

Mở Terminal và chạy từng lệnh:

```bash
cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation/hue-datacenter-visualization/public/images

# Backup
mkdir -p backup
cp *.png backup/

# Resize từng file
sips -Z 1920 Power.png
sips -Z 1920 Power_01.png
sips -Z 1920 Power_02.png
sips -Z 1920 Power_2N1.PNG
sips -Z 1920 Datacenter.png
sips -Z 1920 Connectivity_01.png
sips -Z 1920 Connectivity_02.png
sips -Z 1920 location_01.png
sips -Z 1920 location_02.png
```

## ✅ Kiểm tra sau khi resize

```bash
# Xem kích thước mới
cd hue-datacenter-visualization/public/images
ls -lh *.png
```

Kích thước file sẽ giảm từ 10MB xuống còn khoảng 1-2MB!

## 🎯 Quick Test

```bash
cd hue-datacenter-visualization
npm run dev
# Mở http://localhost:3000 kiểm tra ảnh
```
