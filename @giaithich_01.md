# HEART Website Upgrade - Hướng Dẫn Thực Hiện Chi Tiết

## 1. TỔNG QUAN DỰ ÁN

### Mục tiêu chính
Nâng cấp website HEART (Hue Ecological AI-Robotics Town) dựa trên codebase hiện có tại `/Users/lekhanhcong/05_AI_Code/01_Web_Demo_Tool`, tạo ra một Single Page Application với 6 sections chính, tuân theo thiết kế minimalist và chuyên nghiệp.

### Triết lý thiết kế
- **Minimalist yet Informative**: Sử dụng hiệu quả khoảng trắng
- **Single Page Application**: Tất cả nội dung trên một trang cuộn
- **Clean, Modern Design**: Màu xanh làm điểm nhấn tạo ấn tượng chuyên nghiệp
- **Passive Information Display**: Tập trung vào storytelling thông qua trải nghiệm cuộn

## 2. PHÂN TÍCH KỸ THUẬT CHI TIẾT

### 2.1 Color Scheme Implementation
```css
:root {
  /* Primary Colors */
  --primary-blue: #0099DA;
  --white: #FFFFFF;
  --dark-gray: #1A1A1A;
  --medium-gray: #666666;
  --light-gray: #F8F8F8;
  
  /* Secondary Colors */
  --green-accent: #00563F;
  --border-color: #E5E5E5;
  
  /* Power Infrastructure Colors */
  --voltage-500kv: #E74C3C;
  --voltage-220kv: #3498DB;
  --voltage-110kv: #27AE60;
  
  /* Footer */
  --footer-bg: #4A7C59;
}
```

### 2.2 Typography System
```css
.typography-system {
  font-family: "Proxima Nova", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  /* Heading Scales */
  --h1-size: clamp(36px, 5vw, 54px);
  --h2-size: clamp(28px, 4vw, 40px);
  --h3-size: clamp(24px, 3.5vw, 32px);
  --h4-size: clamp(20px, 3vw, 24px);
  --body-size: 16px;
  --nav-size: 15px;
  --small-size: 14px;
}
```

### 2.3 Layout Structure
```css
.layout-specs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  
  /* Grid System */
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 30px;
  
  /* Responsive Breakpoints */
  @media (max-width: 768px) { padding: 40px 15px; }
  @media (min-width: 1200px) { padding: 80px 20px; }
}
```

## 3. SECTIONS IMPLEMENTATION GUIDE

### 3.1 Navigation Enhancement
**Hiện trạng**: Cần cập nhật navigation để bao gồm 6 sections mới
**Yêu cầu**:
- Height: 80-90px
- Background: #FFFFFF
- Menu spacing: 30-35px
- Active indicator: 3px bottom border #0099DA
- Text transform: UPPERCASE

### 3.2 Location Section
**Nội dung**: "Strategically positioned in Hue Hi-Tech State-owned Park..."
**Animation**: Image loop between location_01.png và location_02.png
```javascript
const locationAnimation = {
  images: ['location_01.png', 'location_02.png'],
  duration: 4000,
  transition: 'crossfade',
  overlap: 500,
  loop: true,
  easing: 'ease-in-out'
};
```

### 3.3 Transportation Section
**Nội dung**: Display location_transportation.png hoặc render từ 01_location_transportation.md
**Thiết kế**: Full-width image với aspect ratio maintained

### 3.4 Data Center Zones Section
**Nội dung**: "300MW Data center can be divided by 100MW each zones..."
**Visual**: Datacenter.png với fade-in animation on scroll

### 3.5 Electricity Infrastructure Section
**Nội dung**: "Hue Hi-Tech Park's 300MW data center has 04 existing 500kV lines..."
**Animation**: 
- Power flow visualization từ 02_500kV_flow.md
- Animated particles flowing through power lines
- 2N+1 redundancy demonstration từ existing codebase
- Color coding: 500kV (Red), 220kV (Blue), 110kV (Green)

### 3.6 Submarine Cable Systems Section
**Nội dung**: "Hue Hi-Tech State Park, 80km from Da Nang Cable Landing Station..."
**Animation**: Image loop giữa Connectivity_01.png và Connectivity_02.png

### 3.7 Footer Section
**Thiết kế**: Implement từ 03_footer.md hoặc Footer.png
**Background**: #4A7C59, Text: #FFFFFF

## 4. TECHNICAL IMPLEMENTATION STRATEGY

### 4.1 Animation Performance
```javascript
const animationConfig = {
  useGPU: true,
  'will-change': 'transform, opacity',
  requestAnimationFrame: true,
  debounce: 16, // ~60fps
};
```

### 4.2 Image Optimization
- WebP format với PNG fallback
- Lazy loading cho below-fold images
- Responsive images với srcset
- Maximum file size: 200KB per image

### 4.3 Scroll Behavior
```css
html {
  scroll-behavior: smooth;
}

.section {
  scroll-snap-align: start;
  scroll-margin-top: 90px;
}
```

### 4.4 Accessibility Implementation
- WCAG 2.1 AA Compliance
- Color contrast ratio: minimum 4.5:1
- ARIA labels cho animations
- prefers-reduced-motion support

## 5. DEVELOPMENT WORKFLOW

### Phase 1: Setup & Analysis (Items 1-50)
1. Analyze existing codebase
2. Setup development environment
3. Configure build tools
4. Prepare asset optimization

### Phase 2: Core Sections Implementation (Items 51-200)
1. Update Navigation component
2. Implement Location Section với image loop
3. Add Transportation Section
4. Create Data Center Zones Section
5. Enhance Electricity Infrastructure Section
6. Implement Submarine Cable Systems Section
7. Update Footer Section

### Phase 3: Animation & Interactions (Items 201-300)
1. Power flow animations
2. Image loop transitions
3. Scroll-triggered animations
4. Performance optimization

### Phase 4: Testing & Quality Assurance (Items 301-400)
1. Cross-browser testing
2. Mobile responsiveness
3. Performance auditing
4. Accessibility compliance

## 6. TESTING STRATEGY

### 6.1 Unit Testing (Items 1-25)
- Component rendering tests
- Animation functionality tests
- Data loading tests
- Responsive behavior tests

### 6.2 Integration Testing (Items 26-50)
- Section interactions
- Navigation functionality
- Image loading sequences
- Animation performance

### 6.3 E2E Testing với Playwright (Items 51-75)
- Full page load testing
- Scroll behavior testing
- Animation timing verification
- Cross-browser compatibility

### 6.4 Performance Testing (Items 76-100)
- Core Web Vitals measurement
- Animation frame rate monitoring
- Bundle size optimization
- Image loading performance

## 7. DELIVERABLES

### Primary Deliverables
1. Enhanced website với 6 sections
2. Optimized animations và interactions
3. Responsive design implementation
4. Cross-browser compatibility
5. Performance optimization
6. Complete test suite

### Quality Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Animation performance: 60 FPS
- Accessibility: WCAG 2.1 AA compliant
- Cross-browser support: Latest 2 versions

## 8. SUCCESS CRITERIA

1. ✅ All 6 sections implemented correctly
2. ✅ Smooth animations at 60 FPS
3. ✅ Image loops working flawlessly
4. ✅ Responsive design on all devices
5. ✅ Performance targets met
6. ✅ All tests passing with screen capture verification
7. ✅ Zero errors in final implementation

---

**Document Version**: 1.0  
**Created**: January 2025  
**Status**: Implementation Ready  
**Complexity**: High (400 todo items + 100 test items)