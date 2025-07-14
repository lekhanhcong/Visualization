# 🔧 HƯỚNG DẪN KHẮC PHỤC LỖI IMAGE SIZE EXCEEDED

## 📋 Mô tả lỗi
```
API Error: 400 
{"type":"error","error":{"type":"invalid_request_error","message":"messages.31.content.21.image.source.base64.data: At least one of the image dimensions exceed max allowed size for many-image requests: 2000 pixels"}}
```

## 🔍 Nguyên nhân
- Các file ảnh trong `/public/images/` có kích thước quá lớn (>2000 pixels)
- Khi upload nhiều ảnh cùng lúc vào Claude, giới hạn tối đa là 2000x2000 pixels

## 📸 Các file cần resize
| File | Kích thước hiện tại | Cần resize |
|------|-------------------|------------|
| Power.png | 10.30 MB | ✅ |
| Power_01.png | 10.30 MB | ✅ |
| Power_02.png | 10.17 MB | ✅ |
| Power_2N1.PNG | 10.17 MB | ✅ |
| Datacenter.png | 7.80 MB | ✅ |
| Connectivity_01.png | 4.45 MB | ✅ |
| Connectivity_02.png | 3.68 MB | ✅ |
| location_01.png | 3.16 MB | ✅ |
| location_02.png | 3.16 MB | ✅ |

## 🛠️ Cách khắc phục

### Phương án 1: Sử dụng Script tự động (Khuyến nghị)

1. **Cài đặt ImageMagick**
   ```bash
   brew install imagemagick
   ```

2. **Chạy script resize**
   ```bash
   cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation
   chmod +x resize-images.sh
   ./resize-images.sh
   ```

### Phương án 2: Resize thủ công bằng macOS Preview

1. Mở file ảnh bằng Preview
2. Tools → Adjust Size...
3. Đặt Width hoặc Height tối đa 1920 pixels
4. Giữ "Scale proportionally" checked
5. Save file

### Phương án 3: Sử dụng online tools

1. Truy cập [TinyPNG](https://tinypng.com/) hoặc [Squoosh](https://squoosh.app/)
2. Upload ảnh
3. Resize xuống max 1920x1920
4. Download và thay thế file gốc

### Phương án 4: Sử dụng Python script

```python
from PIL import Image
import os

image_dir = "./hue-datacenter-visualization/public/images"
max_size = (1920, 1920)

files_to_resize = [
    "Power.png", "Power_01.png", "Power_02.png", 
    "Power_2N1.PNG", "Datacenter.png",
    "Connectivity_01.png", "Connectivity_02.png",
    "location_01.png", "location_02.png"
]

for filename in files_to_resize:
    filepath = os.path.join(image_dir, filename)
    if os.path.exists(filepath):
        img = Image.open(filepath)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(filepath, optimize=True)
        print(f"✅ Resized: {filename}")
```

## 📊 Kết quả mong đợi

Sau khi resize:
- Tất cả ảnh có dimensions ≤ 1920x1920 pixels
- File size giảm đáng kể (thường 70-90%)
- Chất lượng vẫn đủ tốt cho web display

## ✅ Kiểm tra sau khi resize

1. **Verify kích thước**
   ```bash
   # macOS
   sips -g pixelHeight -g pixelWidth ./hue-datacenter-visualization/public/images/*.png
   ```

2. **Test ứng dụng**
   ```bash
   cd hue-datacenter-visualization
   npm run dev
   ```

3. **Kiểm tra visual quality**
   - Mở http://localhost:3000
   - Xem các sections có sử dụng ảnh
   - Đảm bảo ảnh không bị vỡ hoặc mờ

## 🔄 Commit changes

```bash
git add .
git commit -m "fix: resize large images to fix API upload error"
git push
```

## 💡 Phòng tránh trong tương lai

1. **Thêm pre-commit hook** để check image size
2. **Sử dụng responsive images** với srcset
3. **Optimize images** trước khi add vào project
4. **Sử dụng WebP format** cho performance tốt hơn

## 📝 Notes

- Backup file gốc trước khi resize
- Một số ảnh screenshot có thể xóa nếu không cần thiết
- Consider sử dụng CDN cho images trong production
