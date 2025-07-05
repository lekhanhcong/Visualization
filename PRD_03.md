# PRD (Product Requirements Document) - Website Visualization Data Center Hue Hi Tech Park

## 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN

### 1.1 Mục tiêu chính
Xây dựng **một trang website đơn giản** để visualization hình ảnh bản đồ hạ tầng điện của dự án Data Center 300MW AI tại Hue Hi Tech Park. Website chỉ tập trung vào việc hiển thị **một cách đẹp mắt và chuyên nghiệp** bản đồ với các thành phần:

- **4 đường truyền tải điện 500kV** (màu đỏ)
- **Đường truyền tải 220kV** (màu xanh dương) 
- **Đường truyền tải 110kV** (màu hồng)
- **Trạm biến áp 500/220kV** cho Data Center (2x600MVA)
- **Trạm biến áp 110kV La Son** (40MVA)
- **Nhà máy thủy điện Tả Trạch** (2x10.5MW)
- **Khu vực Data Center** trong Hue Hi Tech Park (vùng xanh lá)

### 1.2 Đối tượng và mục đích
- **Trình bày cho nhà đầu tư quốc tế** trong 3 phút
- **Demo trực tiếp** với giao diện tối ưu cho presentation
- **Thể hiện vị trí chiến lược** của Data Center với hạ tầng điện

### 1.3 Phạm vi dự án
- **Single Page Application (SPA)** - chỉ 1 trang duy nhất
- **Không cần backend phức tạp** - chỉ cần static data
- **Tập trung 90% vào frontend** visualization đẹp

## 2. CHỨC NĂNG CỐT LÕI (SIMPLIFIED)

### 2.1 Main Features
**Image-Based Interactive Map:**
- Sử dụng **chính xác hình ảnh bản đồ đã cho** làm background
- **Overlay interactive hotspots** lên các điểm trên hình có sẵn
- **Clickable areas** trên các trạm biến áp và data center
- **Hover effects** hiển thị thông tin tooltip
- **Zoom và pan** functionality trên hình ảnh gốc

**Information Overlays:**
- **Modal popups** khi click vào các điểm đã đánh dấu
- **Legend panel** tương ứng với legend có sẵn trong hình
- **Project highlights** với thông tin về dự án

**Visual Enhancements:**
- **Animated overlays** trên đường điện hiện có
- **Pulse effects** trên các điểm quan trọng
- **Dark/Light theme** toggle
- **Responsive design** cho laptop presentation

### 2.2 Data Management (20% scope)
**Static Data Approach:**
- **JSON files** trong thư mục `/public/data/` cho infrastructure data
- **Static assets** trong `/public/images/` cho hình ảnh và icons
- **Local storage** (optional) cho user preferences như theme
- **No server required** - pure client-side application

## 3. SYSTEM ARCHITECTURE

```
[Static JSON Files] → [NextJS Frontend] → [Interactive Visualization]
        ↓                    ↓                     ↓
[Public Assets] → [React Components] → [User Interface]
        ↓                    ↓                     ↓
[Local Storage] → [Theme & Preferences] → [Smooth Animations]
```

**Data Flow:**
1. **Static Data**: JSON files → React hooks → Component state
2. **Assets**: Public folder → Next.js Image → Optimized display
3. **User Preferences**: Local storage → Context → UI updates
4. **No Server**: Pure client-side, deployed as static site

## 4. SITEMAP (SINGLE PAGE)

```
WEBSITE ROOT
│
└── Home Page (Image-Based Visualization)
    ├── Background Image (Fixed Map từ hình đã cho)
    ├── Interactive Overlay Layer
    ├── Hotspot Components (positioned absolutely)
    ├── Modal System (thông tin chi tiết)
    ├── Legend Panel (Bottom Left - giống trong hình)
    └── Theme Toggle (Top Right)
```

## 5. TECHNICAL IMPLEMENTATION

### 5.1 Frontend Stack (100% scope)

**Core Framework & Architecture:**
- **NextJS 14+** với App Router và Server Components
- **TypeScript 5.0+** với strict mode cho type safety tuyệt đối
- **React 18+** với concurrent features và Suspense
- **Tailwind CSS 3.4+** với custom config và design tokens
- **PostCSS** với autoprefixer và CSS optimization plugins

**State Management & Data Fetching:**
- **TanStack Query (React Query)** cho server state management
- **Zustand** cho client state management (theme, UI preferences)
- **SWR** backup option cho real-time data fetching
- **React Context** cho theme và global settings

**Animation & Visual Effects:**
- **Framer Motion 10+** cho complex animations và gestures
- **Lottie React** cho micro-animations và loading states
- **React Spring** backup cho physics-based animations
- **CSS Houdini** cho advanced visual effects (where supported)
- **GSAP ScrollTrigger** cho scroll-based animations

**Map & Visualization Libraries:**
- **Next.js Image** cho optimized background image
- **CSS transforms** cho zoom/pan functionality trên hình ảnh
- **Absolute positioning** cho hotspot overlays
- **Intersection Observer** cho lazy loading animations
- **Canvas API** (optional) cho custom overlays nếu cần

**UI Component System:**
- **Radix UI Primitives** cho accessible, unstyled components
- **shadcn/ui** component library với custom theming
- **Headless UI** backup components
- **React Hook Form** với Zod validation cho forms
- **Sonner** cho elegant toast notifications

**Icon & Asset Management:**
- **Lucide React** cho consistent icon system
- **Heroicons** backup icon library
- **React SVG** cho custom icon components
- **Next.js Image** với optimization và lazy loading
- **Sharp** cho server-side image processing

**Styling & Design System:**
- **CSS Custom Properties (CSS Variables)** cho dynamic theming
- **Tailwind CSS plugins**: forms, typography, aspect-ratio
- **CSS Modules** cho component-scoped styles when needed
- **Styled Components** fallback cho dynamic styling
- **CVA (Class Variance Authority)** cho component variants

**Performance & Optimization:**
- **Next.js Bundle Analyzer** cho bundle optimization
- **React DevTools Profiler** cho performance monitoring
- **Lighthouse CI** cho automated performance testing
- **Web Vitals** tracking và optimization
- **Service Workers** cho caching strategies

**Development & Quality Tools:**
- **ESLint** với TypeScript và React hooks rules
- **Prettier** cho code formatting
- **Husky** cho git hooks
- **lint-staged** cho pre-commit checks
- **Commitlint** cho conventional commits

**Testing Framework:**
- **Jest** cho unit testing
- **React Testing Library** cho component testing
- **Playwright** cho E2E testing
- **MSW (Mock Service Worker)** cho API mocking

**Advanced Frontend Features:**

**Interactive Map System:**
```typescript
// Custom hook cho map interactions
const useMapVisualization = () => {
  const [zoomLevel, setZoomLevel] = useState(10)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [powerLineAnimations, setPowerLineAnimations] = useState(true)
  
  const mapRef = useRef<L.Map>(null)
  const animationFrameRef = useRef<number>()
  
  // Smooth zoom với easing
  const smoothZoomTo = useCallback((coords, zoom) => {
    mapRef.current?.flyTo(coords, zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    })
  }, [])
  
  return { zoomLevel, selectedPoint, smoothZoomTo, ... }
}
```

**Animation System:**
```typescript
// Framer Motion variants cho consistent animations
export const mapAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  },
  powerLine: {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  }
}
```

**Component Architecture:**
```typescript
// Image-based map components
/components
├── ui/                    // Base UI components
├── atoms/                 // Basic building blocks
│   ├── Hotspot.tsx       // Interactive point trên hình
│   ├── Badge.tsx
│   └── LoadingSkeleton.tsx
├── molecules/             // Composed components
│   ├── HotspotMarker.tsx // Marker với animation
│   ├── InfoTooltip.tsx   // Tooltip khi hover
│   └── InfoModal.tsx     // Modal chi tiết
├── organisms/             // Complex sections
│   ├── ImageMapContainer.tsx  // Main map với hình nền
│   ├── InteractiveOverlay.tsx // Layer overlay trên hình
│   └── LegendPanel.tsx       // Legend như trong hình gốc
└── templates/             // Page layouts
    └── VisualizationLayout.tsx
```

**Advanced Styling System:**
```css
/* Design tokens với CSS custom properties */
:root {
  /* Color system */
  --color-primary-50: #f0f9ff;
  --color-primary-500: #0ea5e9;
  --color-primary-900: #0c4a6e;
  
  /* Infrastructure colors */
  --color-500kv: #ef4444;
  --color-220kv: #3b82f6;
  --color-110kv: #ec4899;
  --color-datacenter: #10b981;
  --color-boundary: #fbbf24;
  --color-accent: #8b5cf6;
  
  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Animation timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* Easing functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-foreground: #f8fafc;
}
```

**Performance Optimization Strategies:**
- **Code splitting** với dynamic imports cho heavy components
- **Virtual scrolling** cho large datasets
- **Intersection Observer** cho lazy loading animations
- **RequestAnimationFrame** cho smooth custom animations
- **Web Workers** cho heavy computations
- **Preloading** critical resources và fonts
- **Image optimization** với WebP/AVIF formats

### 5.2 Data Structure & Files

**Static JSON Data Files:**
```typescript
// /public/data/hotspots.json - Tọa độ các điểm trên hình ảnh
interface ImageHotspot {
  id: string
  name: string
  type: 'substation' | 'datacenter' | 'powerplant'
  position: { 
    x: number, // pixel position từ góc trái trên hình ảnh
    y: number  // pixel position từ góc trái trên hình ảnh
  }
  status: 'operational' | 'planned'
  description: string
  details: {
    capacity?: string
    voltage?: string
    technology?: string
  }
}

// /public/data/image-config.json - Thông tin về hình ảnh
interface ImageConfig {
  originalWidth: number    // Width gốc của hình ảnh
  originalHeight: number   // Height gốc của hình ảnh
  aspectRatio: number      // Tỷ lệ khung hình
  legend: {
    position: { x: number, y: number }
    width: number
    height: number
  }
}
```

**Tọa độ các điểm chính trên hình:**
```json
// Ví dụ hotspots dựa trên hình ảnh đã cho
{
  "hotspots": [
    {
      "id": "datacenter",
      "name": "HUE HI TECH PARK 300MW AI DATA CENTER",
      "type": "datacenter",
      "position": { "x": 650, "y": 520 },
      "description": "Data center chính với công suất 300MW"
    },
    {
      "id": "substation-500kv",
      "name": "500/220KV SUBSTATION FOR 300MW DATA CENTER",
      "type": "substation", 
      "position": { "x": 420, "y": 200 },
      "description": "Trạm biến áp chính 2x600MVA"
    },
    {
      "id": "la-son-substation",
      "name": "110KV LA SON SUBSTATION",
      "type": "substation",
      "position": { "x": 950, "y": 130 },
      "description": "Trạm biến áp La Son 40MVA"
    },
    {
      "id": "ta-trach-plant",
      "name": "TẢ TRẠCH HYDRO POWER PLANT",
      "type": "powerplant",
      "position": { "x": 120, "y": 400 },
      "description": "Nhà máy thủy điện 2x10.5MW"
    }
  ]
}
```

**Custom Hooks for Image-Based Map:**
```typescript
// hooks/useImageMap.ts
export const useImageMap = () => {
  const [hotspots, setHotspots] = useState<ImageHotspot[]>([])
  const [imageConfig, setImageConfig] = useState<ImageConfig | null>(null)
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null)
  const [mapScale, setMapScale] = useState(1)
  const [loading, setLoading] = useState(true)

  // Load data từ JSON files
  useEffect(() => {
    const loadData = async () => {
      const [hotspotsRes, configRes] = await Promise.all([
        fetch('/data/hotspots.json'),
        fetch('/data/image-config.json')
      ])
      
      setHotspots(await hotspotsRes.json())
      setImageConfig(await configRes.json())
      setLoading(false)
    }
    
    loadData()
  }, [])

  // Calculate responsive positions
  const getResponsivePosition = (hotspot: ImageHotspot) => {
    if (!imageConfig) return { x: 0, y: 0 }
    
    return {
      x: (hotspot.position.x / imageConfig.originalWidth) * 100, // Convert to %
      y: (hotspot.position.y / imageConfig.originalHeight) * 100 // Convert to %
    }
  }

  return { 
    hotspots, 
    imageConfig, 
    selectedHotspot, 
    setSelectedHotspot,
    getResponsivePosition,
    loading 
  }
}
```

### 5.3 Frontend Stack (100% scope)

### 5.4 Visual Design Requirements

**Color Scheme:**
- **500kV Lines**: `#ef4444` (red-500)
- **220kV Lines**: `#3b82f6` (blue-500)  
- **110kV Lines**: `#ec4899` (pink-500)
- **Data Center Area**: `#10b981` (emerald-500)
- **Project Boundary**: `#fbbf24` (amber-400) với dashed pattern
- **Background**: Dark gradient `#0f172a` to `#1e293b`
- **Accent**: `#8b5cf6` (violet-500) cho highlights

**Animation Effects:**
- **Power flow**: Dashed lines moving along cables
- **Pulse effects**: Trên các trạm biến áp
- **Hover transitions**: 0.3s ease-in-out
- **Modal animations**: Scale và fade effects
- **Loading states**: Skeleton loaders

**Typography:**
- **Headings**: `font-bold text-2xl md:text-4xl`
- **Descriptions**: `font-medium text-base`
- **Labels**: `text-xs opacity-75`

## 6. IMPLEMENTATION PHASES

### Phase 1: Project Setup (20% - 0.5 day)
1. **Setup NextJS project** với TypeScript + Tailwind
2. **Configure static data structure** với JSON files
3. **Setup component architecture** và folder structure
4. **Install và configure** all required libraries
5. **Create basic layout** và routing

### Phase 2: Image-Based Visualization (60% - 1.5 days)
1. **Setup background image** với responsive scaling
2. **Create hotspot system** với absolute positioning
3. **Implement click/hover interactions** trên các điểm 
4. **Build modal system** cho detailed information
5. **Add zoom/pan functionality** cho hình ảnh
6. **Implement legend panel** giống trong hình gốc

### Phase 3: Polish & Enhancement (20% - 1 day)
1. **Responsive design** optimization
2. **Performance optimization** và lazy loading
3. **Cross-browser testing** và fixes
4. **Animation fine-tuning**
5. **Final UI/UX refinements**

## 7. SUCCESS METRICS

**Performance Targets:**
- **Load time**: < 2 seconds trên WiFi
- **First Contentful Paint**: < 1.5s
- **Smooth animations**: 60fps on modern browsers
- **Mobile responsive**: Perfect display trên tablet

**User Experience:**
- **Intuitive navigation**: Click và hover rõ ràng
- **Information clarity**: Technical specs dễ hiểu
- **Visual impact**: "Wow factor" cho investors
- **Professional appearance**: Consistent với corporate standards

## 8. DELIVERABLES

### 8.1 Primary Deliverables
1. **Static website** deployed và accessible
2. **JSON data files** với infrastructure information
3. **Optimized assets** trong public folder
4. **Source code** với clean Git history
5. **Documentation** cho deployment và updates

### 8.2 Deployment Setup
- **Frontend**: Vercel, Netlify, hoặc GitHub Pages (static hosting)
- **No Backend Required**: Pure static site deployment
- **CDN**: Automatic với static hosting providers
- **Domain**: Custom domain setup

### 8.2 Optional Enhancements
1. **PDF export** functionality cho presentation
2. **Fullscreen mode** cho demo
3. **Keyboard shortcuts** cho presenter
4. **Analytics integration** để track engagement

## 9. PROJECT CONSTRAINTS

**Scope Limitations:**
- **No server-side** functionality required
- **No real-time data** from external systems
- **No user authentication** needed
- **No database** maintenance required
- **No multi-language** support initially

**Timeline:**
- **Project setup**: 0.5 day
- **Core visualization**: 1.5 days
- **Polish & testing**: 1 day  
- **Deployment**: 0.5 day
- **Total**: 3.5 days

**Budget Focus:**
- **100% frontend** development và design
- **No backend costs** - static hosting only
- **Lower hosting costs** với static deployment

---

**Tóm lại:** Đây là một dự án **pure frontend visualization** đơn giản nhưng ấn tượng, sử dụng static data và hosting, tập trung 100% vào việc thể hiện hạ tầng điện của Data Center một cách chuyên nghiệp và hấp dẫn nhà đầu tư trong thời gian ngắn.
