# 📄 XUẤT HEART PAGE THÀNH PDF

## 🚀 Cách 1: Dùng Script Tự Động (Nếu đã có Playwright)

```bash
cd /Users/lekhanhcong/05_AI_Code/v3_01_Web_Demo_Tool_Test_animation/hue-datacenter-visualization
node ../export-heart-playwright.js
```

## 🖱️ Cách 2: Xuất Thủ Công từ Browser (Đơn giản nhất)

1. **Mở trang trong Chrome/Safari:**
   ```
   http://localhost:3000/heart
   ```

2. **Xuất PDF:**
   - Nhấn `Cmd + P` (hoặc File → Print)
   - Destination: Chọn "Save as PDF"
   - Paper size: A3 (landscape) hoặc A4 
   - Margins: Minimum
   - ✅ Bật "Background graphics" 
   - Click "Save"

## 🛠️ Cách 3: Dùng Chrome DevTools

1. Mở http://localhost:3000/heart
2. Nhấn `Cmd + Option + I` mở DevTools
3. Nhấn `Cmd + Shift + P` mở Command Menu
4. Gõ "screenshot" và chọn:
   - "Capture full size screenshot" cho ảnh PNG
   - Hoặc dùng Print (Cmd+P) cho PDF

## 🎯 Cách 4: Script Quick Export

Tạo file `quick-export.sh`:

```bash
#!/bin/bash
echo "📸 Taking screenshot of HEART page..."

# Dùng Chrome headless
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --screenshot=heart-page.png \
  --window-size=1920,1080 \
  http://localhost:3000/heart

echo "✅ Screenshot saved as heart-page.png"

# Convert to PDF using sips (macOS)
sips -s format pdf heart-page.png --out heart-page.pdf

echo "✅ PDF saved as heart-page.pdf"
```

## 💡 Tips để có PDF đẹp:

1. **Đợi trang load hoàn toàn** (animations, images)
2. **Chọn khổ giấy phù hợp:**
   - A3 Landscape: Cho view đầy đủ
   - A4 Portrait: Cho in ấn
3. **Bật Background Graphics** để giữ màu nền
4. **Zoom out** nếu cần xem toàn bộ nội dung

## 📱 Export từ Safari (macOS):

1. Mở http://localhost:3000/heart trong Safari
2. File → Export as PDF...
3. Chọn nơi lưu và đặt tên file

---

**Quick Command:** Copy & paste để xuất nhanh:

```bash
# Mở và xuất từ Chrome
open -a "Google Chrome" http://localhost:3000/heart
# Sau đó nhấn Cmd+P → Save as PDF
```
