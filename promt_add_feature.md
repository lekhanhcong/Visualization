PROMPT CHO CLAUDE CODE - THÊM 2N+1 REDUNDANCY FEATURE
CONTEXT VÀ YÊU CẦU CHÍNH
TASK: Thêm feature "2N+1 Redundancy Visualization" vào project Version 01 hiện tại để tạo Version 02, sử dụng Plugin Architecture pattern.

INPUT FILES:

@2n_1_feature.md - Specification chi tiết của feature 2N+1 Redundancy
@guideline_add_features.md - Hướng dẫn Plugin Architecture pattern
OUTPUT REQUIRED:

Tạo file plan.md chứa 300 todo list items
Mỗi item có checkbox format: [ ] (chưa hoàn thành) hoặc [x] (đã hoàn thành)
Mỗi major task phải có sub-tasks để test
Sử dụng MCP Context7 cho code mới nhất
Include Playwright tests cho mỗi component
YÊU CẦU CHI TIẾT
1. ĐỌC VÀ PHÂN TÍCH
Đầu tiên, hãy đọc kỹ:

File @2n_1_feature.md để hiểu đầy đủ requirements của feature 2N+1
File @guideline_add_features.md để hiểu cách implement theo Plugin Architecture
2. NGUYÊN TẮC QUAN TRỌNG KHI TẠO PLAN
2.1 Plugin Architecture Rules:

KHÔNG modify bất kỳ file nào trong core application
Feature phải nằm trong folder /features/redundancy/
Phải có feature flag: NEXT_PUBLIC_ENABLE_REDUNDANCY
CSS prefix: rdx-
Hoàn toàn độc lập và có thể remove mà không ảnh hưởng app
2.2 Feature Requirements từ 2n_1_feature.md:

Highlight 4 existing 500kV lines (2 đỏ active, 2 vàng standby)
Show 2 substations (1 existing + 1 new)
Display info panel với statistics
Professional animations
Based on existing map - không vẽ lại
2.3 Testing Requirements:

Unit tests cho mỗi component
Integration tests cho feature
Playwright E2E tests
Performance tests
Responsive tests
3. STRUCTURE CỦA PLAN.MD
File plan.md cần có structure như sau:

markdown
# PLAN: ADD 2N+1 REDUNDANCY FEATURE TO VERSION 02

## Overview
- Total tasks: 300
- Estimated time: [X days]
- Using Plugin Architecture from @guideline_add_features.md
- Feature spec from @2n_1_feature.md

## Phase 1: Setup & Foundation (Tasks 1-50)
### 1.1 Project Setup (Tasks 1-10)
- [ ] Task 1: Create feature branch `feature/2n1-redundancy`
- [ ] Task 2: Setup folder structure `/features/redundancy/`
- [ ] Task 3: Create initial file structure
  - [ ] Sub-task 3.1: Create index.ts
  - [ ] Sub-task 3.2: Create config.ts
  - [ ] Sub-task 3.3: Create README.md
- [ ] Task 4: Add feature flag to .env.local
- [ ] Task 5: Test feature flag works
  - [ ] Sub-task 5.1: Flag ON test
  - [ ] Sub-task 5.2: Flag OFF test
[... continue to Task 10]

### 1.2 Plugin Registration (Tasks 11-20)
[... tasks for plugin setup]

### 1.3 Base Component Structure (Tasks 21-30)
[... tasks for component creation]

### 1.4 Initial Tests Setup (Tasks 31-40)
[... tasks for test infrastructure]

### 1.5 Documentation Setup (Tasks 41-50)
[... tasks for docs]

## Phase 2: Core Implementation (Tasks 51-150)
### 2.1 Map Overlay System (Tasks 51-70)
[... tasks for overlay implementation]

### 2.2 Line Highlighting (Tasks 71-90)
[... tasks for highlighting existing lines]

### 2.3 Substation Markers (Tasks 91-110)
[... tasks for substation display]

### 2.4 Info Panel (Tasks 111-130)
[... tasks for statistics panel]

### 2.5 Animations (Tasks 131-150)
[... tasks for animations]

## Phase 3: Testing & Quality (Tasks 151-200)
### 3.1 Unit Tests (Tasks 151-170)
[... unit test tasks]

### 3.2 Integration Tests (Tasks 171-185)
[... integration test tasks]

### 3.3 E2E Playwright Tests (Tasks 186-200)
[... E2E test tasks]

## Phase 4: Polish & Optimization (Tasks 201-250)
### 4.1 Performance Optimization (Tasks 201-220)
[... optimization tasks]

### 4.2 Responsive Design (Tasks 221-235)
[... responsive tasks]

### 4.3 Cross-browser Testing (Tasks 236-250)
[... browser testing tasks]

## Phase 5: Final Integration & Deployment (Tasks 251-300)
### 5.1 Integration with Main App (Tasks 251-270)
[... integration tasks]

### 5.2 Documentation & Examples (Tasks 271-285)
[... documentation tasks]

### 5.3 Final Testing & Sign-off (Tasks 286-300)
[... final verification tasks]
4. MỖI TASK PHẢI CÓ
4.1 Clear description:

markdown
- [ ] Task X: [Action verb] [what] [purpose]
  Example: "Create RedundancyOverlay component for displaying line highlights"
4.2 Test sub-tasks:

markdown
- [ ] Task X: Implement feature Y
  - [ ] Sub-task X.1: Write unit test for Y
  - [ ] Sub-task X.2: Run test and verify passes
  - [ ] Sub-task X.3: Check coverage >= 80%
4.3 MCP Context7 usage:

markdown
- [ ] Task X: Get latest React patterns from Context7
  - [ ] Sub-task X.1: Query Context7 for "React overlay components"
  - [ ] Sub-task X.2: Apply best practices to implementation
4.4 Playwright test tasks:

markdown
- [ ] Task X: Create E2E test for feature toggle
  - [ ] Sub-task X.1: Write Playwright test script
  - [ ] Sub-task X.2: Test feature ON scenario
  - [ ] Sub-task X.3: Test feature OFF scenario
  - [ ] Sub-task X.4: Verify no console errors
5. SPECIFIC TASK EXAMPLES
Dưới đây là ví dụ cụ thể cho một số tasks quan trọng:

markdown
## Detailed Task Examples:

- [ ] Task 15: Register redundancy feature in plugin system
  - [ ] Sub-task 15.1: Create redundancy config object
  - [ ] Sub-task 15.2: Import featureRegistry
  - [ ] Sub-task 15.3: Call featureRegistry.register()
  - [ ] Sub-task 15.4: Test registration successful
  - [ ] Sub-task 15.5: Verify feature appears in registry list

- [ ] Task 72: Highlight Quảng Trạch to Substation 01 line
  - [ ] Sub-task 72.1: Identify exact line segment in existing map
  - [ ] Sub-task 72.2: Create SVG path overlay matching line
  - [ ] Sub-task 72.3: Apply red glow effect (color: #ef4444)
  - [ ] Sub-task 72.4: Test glow visible on all screen sizes
  - [ ] Sub-task 72.5: Verify alignment with base map line
  - [ ] Sub-task 72.6: Performance test (60fps maintained)

- [ ] Task 95: Add Substation 02 marker
  - [ ] Sub-task 95.1: Calculate position (~800m SE of Sub 01)
  - [ ] Sub-task 95.2: Create marker component with yellow color
  - [ ] Sub-task 95.3: Add label "SUBSTATION 02 - 600MW STANDBY"
  - [ ] Sub-task 95.4: Test marker responsive positioning
  - [ ] Sub-task 95.5: Verify click/hover interactions work
  - [ ] Sub-task 95.6: Check z-index above map but below info

- [ ] Task 187: Playwright E2E test for complete user flow
  - [ ] Sub-task 187.1: Setup Playwright test file
  - [ ] Sub-task 187.2: Test navigate to page
  - [ ] Sub-task 187.3: Test click "Show 2N+1 Redundancy" button
  - [ ] Sub-task 187.4: Verify overlay appears
  - [ ] Sub-task 187.5: Check 4 lines highlighted correctly
  - [ ] Sub-task 187.6: Verify 2 substations visible
  - [ ] Sub-task 187.7: Test info panel displays correct data
  - [ ] Sub-task 187.8: Test close functionality
  - [ ] Sub-task 187.9: Verify return to normal state
  - [ ] Sub-task 187.10: Check no memory leaks
6. TESTING PATTERNS TO INCLUDE
Mỗi component/feature cần có:

Unit tests: Test isolated functionality
Integration tests: Test với other components
Visual regression tests: Screenshot comparisons
Performance tests: FPS, load time, memory
Accessibility tests: Keyboard nav, screen readers
Cross-browser tests: Chrome, Safari, Edge, Firefox
7. FINAL CHECKLIST IN PLAN
Cuối file plan.md cần có:

markdown
## Final Verification Checklist
- [ ] All 300 tasks completed
- [ ] All tests passing
- [ ] Feature flag working correctly
- [ ] No console errors
- [ ] Performance metrics met
- [ ] Documentation complete
- [ ] Code review passed
- [ ] Ready for deployment
EXECUTION INSTRUCTIONS
Start by reading both input files thoroughly
Create plan.md with exactly 300 tasks
Ensure each major task has test sub-tasks
Follow Plugin Architecture strictly
Include MCP Context7 usage where relevant
Add Playwright tests throughout
Maintain clear task numbering and organization
Use checkbox format consistently
IMPORTANT:

Mỗi task phải specific và actionable
Không được modify core application files
Feature phải completely removable
All tasks initially marked as [ ] (not completed)
Hãy tạo file plan.md với đầy đủ 300 tasks theo structure và requirements trên.

