# **PRD (Product Requirements Document) \- Website Visualization Data Center Hue Hi Tech Park**

## **1\. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN**

### **1.1 Mục tiêu chính**

Xây dựng **một trang website đơn giản** để visualization hình ảnh bản đồ hạ tầng điện của dự án Data Center 300MW AI tại Hue Hi Tech Park. Website chỉ tập trung vào việc hiển thị **một cách đẹp mắt và chuyên nghiệp** bản đồ với các thành phần:

* **4 đường truyền tải điện 500kV** (màu đỏ)  
* **Đường truyền tải 220kV** (màu xanh dương)  
* **Đường truyền tải 110kV** (màu hồng)  
* **Trạm biến áp 500/220kV** cho Data Center (2x600MVA)  
* **Trạm biến áp 110kV La Son** (40MVA)  
* **Nhà máy thủy điện Tả Trạch** (2x10.5MW)  
* **Khu vực Data Center** trong Hue Hi Tech Park (vùng xanh lá)

### **1.2 Đối tượng và mục đích**

* **Trình bày cho nhà đầu tư quốc tế** trong 3 phút  
* **Demo trực tiếp** với giao diện tối ưu cho presentation  
* **Thể hiện vị trí chiến lược** của Data Center với hạ tầng điện

### **1.3 Phạm vi dự án**

* **Single Page Application (SPA)** \- chỉ 1 trang duy nhất  
* **Không cần backend phức tạp** \- chỉ cần static data  
* **Tập trung 90% vào frontend** visualization đẹp

## **2\. CHỨC NĂNG CỐT LÕI (SIMPLIFIED)**

### **2.1 Main Features**

**Interactive Map Display:**

* Hiển thị bản đồ dựa trên hình ảnh đã cho  
* **Clickable hotspots** trên các điểm quan trọng  
* **Hover effects** với thông tin tooltip  
* **Smooth zoom** và pan functionality  
* **Animated power lines** thể hiện dòng điện chảy

**Information Overlays:**

* **Modal popups** khi click vào các điểm  
* **Legend panel** giải thích ký hiệu màu sắc  
* **Project highlights** với số liệu ấn tượng

**Visual Enhancements:**

* **Dark/Light theme** phù hợp môi trường demo  
* **Gradient backgrounds** theo phong cách Cursor  
* **Glass morphism effects** cho modern look  
* **Responsive design** cho laptop presentation

### **2.2 Backend (20% scope)**

**API Management:**

* **NestJS RESTful APIs** cho infrastructure data  
* **MongoDB** lưu trữ thông tin điểm hạ tầng và technical specs  
* **MinIO** quản lý hình ảnh, icons, và assets  
* **Basic CRUD operations** cho data serving

## **3\. SYSTEM ARCHITECTURE**

\[Frontend NextJS\] ↔ \[NestJS Backend\] ↔ \[MongoDB Database\]

        ↓                    ↓                     ↓

\[Interactive UI\] ← \[RESTful APIs\] ← \[Infrastructure Data\]

        ↓                    ↓                     ↓

\[User Experience\] ← \[File Serving\] ← \[MinIO Storage\]

**Data Flow:**

1. **Static Assets**: Images, icons → MinIO → Frontend  
2. **Dynamic Content**: Infrastructure info → MongoDB → NestJS APIs → Frontend  
3. **Admin Updates**: Content changes → NestJS → MongoDB  
4. **File Management**: Asset uploads → MinIO via NestJS

## **4\. SITEMAP (SINGLE PAGE)**

WEBSITE ROOT

│

└── Home Page (Interactive Visualization)

    ├── Map Container (Full Screen)

    ├── Legend Panel (Bottom Left)

    ├── Info Panel (Right Side \- Collapsible)

    └── Theme Toggle (Top Right)

## **5\. TECHNICAL IMPLEMENTATION**

### **5.2 Backend Stack (20% scope)**

**Core Technologies:**

* **NestJS** với TypeScript  
* **MongoDB** với Mongoose ODM  
* **MinIO** cho file storage  
* **Basic seeding** cho initial data

**API Endpoints:**

typescript

*// Infrastructure endpoints*

GET /api/infrastructure/points

GET /api/infrastructure/lines  

GET /api/infrastructure/:id

*// File serving*

GET /api/files/:filename

**Database Schema:**

typescript

*// MongoDB Collections*

Infrastructure: {

  \_id: ObjectId

  name: string

  type: string

  position: { x: number, y: number }

  status: string

  description: string

  createdAt: Date

  updatedAt: Date

}

PowerLines: {

  \_id: ObjectId

  from: ObjectId

  to: ObjectId

  voltage: string

  color: string

  animated: boolean

}

Assets: {

  \_id: ObjectId

  filename: string

  originalName: string

  mimeType: string

  size: number

  url: string

  uploadedAt: Date

}

### **5.3 Frontend Stack (80% scope)**

**Core Framework & Architecture:**

* **NextJS 14+** với App Router và Server Components  
* **TypeScript 5.0+** với strict mode cho type safety tuyệt đối  
* **React 18+** với concurrent features và Suspense  
* **Tailwind CSS 3.4+** với custom config và design tokens  
* **PostCSS** với autoprefixer và CSS optimization plugins

**State Management & Data Fetching:**

* **TanStack Query (React Query)** cho server state management  
* **Zustand** cho client state management (theme, UI preferences)  
* **SWR** backup option cho real-time data fetching  
* **React Context** cho theme và global settings

**Animation & Visual Effects:**

* **Framer Motion 10+** cho complex animations và gestures  
* **Lottie React** cho micro-animations và loading states  
* **React Spring** backup cho physics-based animations  
* **CSS Houdini** cho advanced visual effects (where supported)  
* **GSAP ScrollTrigger** cho scroll-based animations

**Map & Visualization Libraries:**

* **React Leaflet** với custom tile layers  
* **D3.js** cho custom SVG visualizations và data binding  
* **Three.js \+ React Three Fiber** cho 3D elements (optional enhancements)  
* **Mapbox GL JS** cho advanced mapping features  
* **Canvas API** cho custom drawing và animations

**UI Component System:**

* **Radix UI Primitives** cho accessible, unstyled components  
* **shadcn/ui** component library với custom theming  
* **Headless UI** backup components  
* **React Hook Form** với Zod validation cho forms  
* **Sonner** cho elegant toast notifications

**Icon & Asset Management:**

* **Lucide React** cho consistent icon system  
* **Heroicons** backup icon library  
* **React SVG** cho custom icon components  
* **Next.js Image** với optimization và lazy loading  
* **Sharp** cho server-side image processing

**Styling & Design System:**

* **CSS Custom Properties (CSS Variables)** cho dynamic theming  
* **Tailwind CSS plugins**: forms, typography, aspect-ratio  
* **CSS Modules** cho component-scoped styles when needed  
* **Styled Components** fallback cho dynamic styling  
* **CVA (Class Variance Authority)** cho component variants

**Performance & Optimization:**

* **Next.js Bundle Analyzer** cho bundle optimization  
* **React DevTools Profiler** cho performance monitoring  
* **Lighthouse CI** cho automated performance testing  
* **Web Vitals** tracking và optimization  
* **Service Workers** cho caching strategies

**Development & Quality Tools:**

* **ESLint** với TypeScript và React hooks rules  
* **Prettier** cho code formatting  
* **Husky** cho git hooks  
* **lint-staged** cho pre-commit checks  
* **Commitlint** cho conventional commits

**Testing Framework:**

* **Jest** cho unit testing  
* **React Testing Library** cho component testing  
* **Playwright** cho E2E testing  
* **MSW (Mock Service Worker)** cho API mocking

**Advanced Frontend Features:**

**Interactive Map System:**

typescript

*// Custom hook cho map interactions*

const useMapVisualization \= () \=\> {

  const \[zoomLevel, setZoomLevel\] \= useState(10)

  const \[selectedPoint, setSelectedPoint\] \= useState(null)

  const \[powerLineAnimations, setPowerLineAnimations\] \= useState(true)


  const mapRef \= useRef\<L.Map\>(null)

  const animationFrameRef \= useRef\<number\>()


  *// Smooth zoom với easing*

  const smoothZoomTo \= useCallback((coords, zoom) \=\> {

    mapRef.current?.flyTo(coords, zoom, {

      duration: 1.5,

      easeLinearity: 0.25

    })

  }, \[\])


  return { zoomLevel, selectedPoint, smoothZoomTo, ... }

}

**Animation System:**

typescript

*// Framer Motion variants cho consistent animations*

export const mapAnimations \= {

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

**Component Architecture:**

typescript

*// Atomic design pattern*

/components

├── ui/                    *// Radix UI \+ shadcn/ui base components*

├── atoms/                 *// Basic building blocks*

│   ├── Icon.tsx

│   ├── Badge.tsx

│   └── LoadingSkeleton.tsx

├── molecules/             *// Composed components*

│   ├── PowerLineSegment.tsx

│   ├── InfrastructurePin.tsx

│   └── InfoCard.tsx

├── organisms/             *// Complex UI sections*

│   ├── InteractiveMap.tsx

│   ├── InfoPanel.tsx

│   └── LegendPanel.tsx

└── templates/             *// Page-level layouts*

    └── VisualizationLayout.tsx

**Advanced Styling System:**

css

*/\* Design tokens với CSS custom properties \*/*

:root {

  */\* Color system \*/*

  \--color-primary-50: \#f0f9ff;

  \--color-primary-500: \#0ea5e9;

  \--color-primary-900: \#0c4a6e;


  */\* Spacing scale \*/*

  \--space-1: 0.25rem;

  \--space-2: 0.5rem;

  \--space-4: 1rem;

  \--space-8: 2rem;


  */\* Animation timing \*/*

  \--duration-fast: 150ms;

  \--duration-normal: 300ms;

  \--duration-slow: 500ms;


  */\* Easing functions \*/*

  \--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  \--ease-spring: cubic-bezier(0.68, \-0.55, 0.265, 1.55);

}

*/\* Dark theme overrides \*/*

\[data-theme\="dark"\] {

  \--color-background: \#0f172a;

  \--color-foreground: \#f8fafc;

}

**Performance Optimization Strategies:**

* **Code splitting** với dynamic imports cho heavy components  
* **Virtual scrolling** cho large datasets  
* **Intersection Observer** cho lazy loading animations  
* **RequestAnimationFrame** cho smooth custom animations  
* **Web Workers** cho heavy computations  
* **Preloading** critical resources và fonts  
* **Image optimization** với WebP/AVIF formats

### **5.4 Data Structure**

typescript

interface InfrastructurePoint {

  id: string

  name: string

  type: 'substation' | 'datacenter' | 'powerplant'

  position: { x: number, y: number } *// % từ góc trái trên*

  status: 'operational' | 'planned'

  description: string

}

interface PowerLine {

  id: string

  from: string *// point id*

  to: string   *// point id*  

  voltage: '500kV' | '220kV' | '110kV'

  color: string

  animated: boolean

}

### **5.5 Visual Design Requirements**

**Color Scheme:**

* **500kV Lines**: `#ef4444` (red-500)  
* **220kV Lines**: `#3b82f6` (blue-500)  
* **110kV Lines**: `#ec4899` (pink-500)  
* **Data Center Area**: `#10b981` (emerald-500)  
* **Background**: Dark gradient `#0f172a` to `#1e293b`  
* **Accent**: `#8b5cf6` (violet-500) cho highlights

**Animation Effects:**

* **Power flow**: Dashed lines moving along cables  
* **Pulse effects**: Trên các trạm biến áp  
* **Hover transitions**: 0.3s ease-in-out  
* **Modal animations**: Scale và fade effects  
* **Loading states**: Skeleton loaders

**Typography:**

* **Headings**: `font-bold text-2xl md:text-4xl`  
* **Descriptions**: `font-medium text-base`  
* **Labels**: `text-xs opacity-75`

## **6\. IMPLEMENTATION PHASES**

### **Phase 1: Backend Setup (30% \- 1 day)**

1. **Setup NestJS project** với TypeScript  
2. **Configure MongoDB** connection và schemas  
3. **Setup MinIO** cho file storage  
4. **Create basic APIs** cho infrastructure data  
5. **Seed database** với initial data

### **Phase 2: Frontend Core (50% \- 2 days)**

1. **Setup NextJS project** với TypeScript \+ Tailwind  
2. **Integrate with backend APIs** cho data fetching  
3. **Create map container** với zoom/pan functionality  
4. **Implement interactive hotspots** với hover effects  
5. **Add modal system** cho detailed information  
6. **Create animated power lines** với CSS animations

### **Phase 3: Integration & Polish (20% \- 1 day)**

1. **Connect frontend với backend**  
2. **File serving** từ MinIO  
3. **Error handling** và loading states  
4. **Responsive design** optimization  
5. **Performance optimization**  
6. **Cross-browser testing** và fixes

## **7\. SUCCESS METRICS**

**Performance Targets:**

* **Load time**: \< 2 seconds trên WiFi  
* **First Contentful Paint**: \< 1.5s  
* **Smooth animations**: 60fps on modern browsers  
* **Mobile responsive**: Perfect display trên tablet

**User Experience:**

* **Intuitive navigation**: Click và hover rõ ràng  
* **Information clarity**: Technical specs dễ hiểu  
* **Visual impact**: "Wow factor" cho investors  
* **Professional appearance**: Consistent với corporate standards

## **8\. DELIVERABLES**

### **8.1 Primary Deliverables**

1. **Production website** deployed và accessible  
2. **NestJS backend** với APIs và database  
3. **MongoDB database** với seeded data  
4. **MinIO storage** với optimized assets  
5. **Source code** với clean Git history  
6. **Documentation** cho deployment và updates

### **8.2 Deployment Setup**

* **Frontend**: Vercel hoặc Netlify  
* **Backend**: Railway, DigitalOcean, hoặc AWS  
* **Database**: MongoDB Atlas  
* **File Storage**: MinIO Cloud hoặc self-hosted

### **8.2 Optional Enhancements**

1. **PDF export** functionality cho presentation  
2. **Fullscreen mode** cho demo  
3. **Keyboard shortcuts** cho presenter  
4. **Analytics integration** để track engagement

## **9\. PROJECT CONSTRAINTS**

**Scope Limitations:**

* **No user authentication** required  
* **No real-time data** from external systems  
* **No complex backend** APIs needed  
* **No multi-language** support initially

**Timeline:**

* **Backend setup**: 1 day  
* **Frontend development**: 2 days  
* **Integration**: 1 day  
* **Testing & refinement**: 1 day  
* **Deployment**: 0.5 day  
* **Total**: 5.5 days

**Budget Focus:**

* **80% frontend** development và design  
* **20% backend** APIs và database setup

---

**Tóm lại:** Đây là một dự án visualization đơn giản nhưng ấn tượng, tập trung vào việc thể hiện hạ tầng điện của Data Center một cách chuyên nghiệp và hấp dẫn nhà đầu tư trong thời gian ngắn.

