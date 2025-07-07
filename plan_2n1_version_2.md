# Plan 2N+1 Version 2 - Siêu Đơn Giản

## 🎯 Mục Tiêu
Hiệu chỉnh Feature 2N+1 thành phiên bản siêu đơn giản:
- Giữ nguyên Version 1 (map hiện tại)
- Khi click "Show 2N+1 Redundancy": Thay hình nền bằng hình Power_2N1.PNG và thêm text "500KV ONSITE GRID"
- Click lại để quay về Version 1

## 📋 TODO LIST TASK ITEMS

### 🔧 Phase 1: Setup và Chuẩn Bị
- [x] 1.1 Tạo file Power_2N1.PNG trong thư mục public/images/
- [x] 1.2 Backup current redundancy feature code
- [x] 1.3 Update image configuration in public/data/image-config.json
- [x] 1.4 Create new simplified RedundancyFeature component
- [x] 1.5 Test image loading và path resolution

### 🎨 Phase 2: UI Implementation - Background Swap
- [x] 2.1 Modify main page component to handle background image swap
- [x] 2.2 Create state management for background toggle
- [x] 2.3 Implement smooth transition between images
- [x] 2.4 Test background image swap functionality
- [x] 2.5 Verify image aspect ratio and positioning

### 📝 Phase 3: Text Overlay Implementation
- [x] 3.1 Create text overlay component for "500KV ONSITE GRID"
- [x] 3.2 Position text overlay correctly on Power_2N1.PNG
- [x] 3.3 Style text with appropriate font, size, and color
- [x] 3.4 Test text overlay positioning across different screen sizes
- [x] 3.5 Ensure text is readable and well-positioned

### 🔄 Phase 4: Toggle Functionality
- [x] 4.1 Update button behavior for simple toggle (show/hide)
- [x] 4.2 Change button text dynamically ("Show 2N+1" → "Back to Main")
- [x] 4.3 Implement click handler for toggle functionality
- [x] 4.4 Test toggle between Version 1 and 2N+1 view
- [x] 4.5 Verify button state changes correctly

### 🎭 Phase 5: Remove Complex Features
- [x] 5.1 Remove complex overlay modal system
- [x] 5.2 Remove SVG transmission lines and animations
- [x] 5.3 Remove substation markers and info panels
- [x] 5.4 Simplify component structure
- [x] 5.5 Clean up unused CSS and dependencies

### 🧪 Phase 6: Unit Testing (Test mỗi component nhỏ)
- [x] 6.1 Test background image loading component
- [x] 6.2 Test text overlay component rendering
- [x] 6.3 Test button toggle state management
- [x] 6.4 Test image swap functionality
- [x] 6.5 Test responsive behavior on different screen sizes

### 🎯 Phase 7: Data Flow Testing với Playwright
- [x] 7.1 **Data Flow 1**: Initial page load
  - [x] 7.1.1 Navigate to application
  - [x] 7.1.2 Verify original background image loads
  - [x] 7.1.3 Verify button is visible with correct text
  - [x] 7.1.4 Screen capture initial state
  - [x] 7.1.5 Check console for errors

- [x] 7.2 **Data Flow 2**: Click to show 2N+1 view
  - [x] 7.2.1 Click "Show 2N+1 Redundancy" button
  - [x] 7.2.2 Verify background changes to Power_2N1.PNG
  - [x] 7.2.3 Verify "500KV ONSITE GRID" text appears
  - [x] 7.2.4 Verify button text changes
  - [x] 7.2.5 Screen capture 2N+1 state
  - [x] 7.2.6 Check console for errors

- [x] 7.3 **Data Flow 3**: Click to return to Version 1
  - [x] 7.3.1 Click button to return to main view
  - [x] 7.3.2 Verify background returns to original image
  - [x] 7.3.3 Verify text overlay disappears
  - [x] 7.3.4 Verify button text resets
  - [x] 7.3.5 Screen capture return state
  - [x] 7.3.6 Check console for errors

- [x] 7.4 **Data Flow 4**: Multiple toggle cycles
  - [x] 7.4.1 Perform 5 toggle cycles rapidly
  - [x] 7.4.2 Verify no memory leaks
  - [x] 7.4.3 Verify smooth transitions
  - [x] 7.4.4 Screen capture during rapid toggle
  - [x] 7.4.5 Check performance metrics

- [x] 7.5 **Data Flow 5**: Responsive testing
  - [x] 7.5.1 Test on desktop viewport (1920x1080)
  - [x] 7.5.2 Test on tablet viewport (768x1024)
  - [x] 7.5.3 Test on mobile viewport (375x667)
  - [x] 7.5.4 Screen capture all viewport sizes
  - [x] 7.5.5 Verify text positioning on all sizes

- [x] 7.6 **Data Flow 6**: Error handling
  - [x] 7.6.1 Test with missing Power_2N1.PNG
  - [x] 7.6.2 Test with corrupted image
  - [x] 7.6.3 Test network disconnection scenarios
  - [x] 7.6.4 Verify graceful error handling
  - [x] 7.6.5 Screen capture error states

### 🔧 Phase 8: Bug Fixes (Sau mỗi lần test)
- [x] 8.1 Fix image loading issues (✅ No issues found)
- [x] 8.2 Fix text positioning issues (✅ No issues found)
- [x] 8.3 Fix toggle functionality issues (✅ No issues found)
- [x] 8.4 Fix responsive design issues (✅ No issues found)
- [x] 8.5 Fix performance issues (✅ No issues found)

### ✅ Phase 9: Final Verification
- [x] 9.1 Run complete Playwright test suite
- [x] 9.2 Verify all screenshots show correct behavior
- [x] 9.3 Check performance metrics meet standards
- [x] 9.4 Verify accessibility compliance
- [x] 9.5 Final code review and cleanup

### 📦 Phase 10: Documentation và Deployment
- [x] 10.1 Update README with new simplified feature
- [x] 10.2 Update @plan.md with completed work
- [x] 10.3 Create test_2n1_ver02.md with test results
- [ ] 10.4 Commit changes to repository
- [ ] 10.5 Deploy and verify in production

## 🎯 Expected Outcome
Feature 2N+1 sẽ trở thành:
- **Đơn giản**: Chỉ swap background image và thêm text
- **Nhanh**: Không có animations phức tạp
- **Ổn định**: Ít code hơn = ít bugs hơn
- **Dễ maintain**: Cấu trúc đơn giản, dễ hiểu

## 📊 Success Criteria
- [ ] Background image swap hoạt động mượt mà
- [ ] Text "500KV ONSITE GRID" hiển thị đúng vị trí
- [ ] Button toggle hoạt động perfect
- [ ] Zero JavaScript errors
- [ ] All Playwright tests pass
- [ ] Performance tốt trên mọi devices

---
*Created: 2025-07-07*  
*Status: In Progress*