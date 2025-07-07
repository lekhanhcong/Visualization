# Báo cáo lỗi và danh sách công việc cho dự án Hue Datacenter Visualization

Đây là báo cáo chi tiết về các lỗi được phát hiện trong dự án. Các mục được đánh dấu là các công việc cần thực hiện để khắc phục.

## 1. Lỗ hổng bảo mật (12 lỗ hổng)

- [ ] **cookie <0.7.0**: Tên, đường dẫn và miền của cookie chấp nhận các ký tự ngoài giới hạn. (GHSA-pxg6-pf52-xh8x)
- [ ] **got <11.8.5**: `got` cho phép chuyển hướng đến một socket UNIX. (GHSA-pfrx-2q88-qq97)
- [ ] **lodash.set***: Ô nhiễm nguyên mẫu trong `lodash`. (GHSA-p6mc-m468-83gw)
- [ ] **semver 7.0.0 - 7.5.1**: `semver` dễ bị tấn công Từ chối dịch vụ Biểu thức chính quy. (GHSA-c2qf-rxjj-qqgw)
- [ ] **(và 8 lỗ hổng khác)**: Cần chạy `npm audit` để xem chi tiết và áp dụng bản vá bằng `npm audit fix --force`.

## 2. Lỗi chất lượng mã nguồn (ESLint)

- [ ] **`src/components/RedundancyVisualization.tsx`**: Lỗi `prefer-as-const`.
- [ ] **`src/components/__tests__/Hotspot.test.tsx`**: Biến không sử dụng (`waitFor`, `button`) và sử dụng kiểu `any` không mong muốn.
- [ ] **`src/components/__tests__/InfoModal.test.tsx`**: Biến không sử dụng (`rerender`) và sử dụng kiểu `any` không mong muốn.
- [ ] **`src/components/__tests__/InfoTooltip.test.tsx`**: Sử dụng kiểu `any` không mong muốn.
- [ ] **`src/components/__tests__/PerformanceMonitor.test.tsx`**: Biến không sử dụng (`fireEvent`, `performanceCallback`) và sử dụng kiểu `any` không mong muốn.
- [ ] **`src/components/__tests__/ThemeToggle.test.tsx`**: Biến không sử dụng (`fireEvent`) và sử dụng kiểu `any` không mong muốn.
- [ ] **`src/utils/performance.ts`**: Sử dụng kiểu `any` không mong muốn.

## 3. Lỗi kiểu dữ liệu (TypeScript - 32 lỗi)

- [ ] **Nhiều tệp kiểm thử (`Hero.test.tsx`, `Hotspot.test.tsx`, `InfoModal.test.tsx`, v.v.)**: Lỗi `TS2554: Expected 1 arguments, but got 2` khi sử dụng `toHaveClass`. Hàm này chỉ chấp nhận một chuỗi chứa tất cả các lớp, không phải nhiều đối số chuỗi.
- [ ] **`src/components/__tests__/InfoTooltip.test.tsx`**: Lỗi `TS2322: Type 'number' is not assignable to type 'string'` khi sử dụng `toHaveStyle` với `zIndex`.
- [ ] **`src/components/__tests__/InfoTooltip.test.tsx`**: Lỗi `TS2322` do gán một đối tượng `hotspot` có trạng thái `"offline"` không hợp lệ.
- [ ] **`src/components/__tests__/PerformanceMonitor.test.tsx`**: Lỗi `TS2540: Cannot assign to 'NODE_ENV' because it is a read-only property`. Không thể gán lại giá trị cho biến môi trường này trong mã nguồn.

## 4. Lỗi kiểm thử đơn vị (Jest - 89 lỗi)

- [ ] **`tests/unit/redundancy-dependencies.test.ts`**: Nhiều bài kiểm thử thất bại liên quan đến việc kiểm tra các phụ thuộc phát triển như React DevTools và Hot Module Reload.
- [ ] **`tests/unit/useVisualizationStore.test.ts`**: Lỗi `TypeError: Cannot redefine property: documentElement` khi cố gắng mock `document`.
- [ ] **`tests/unit/useImageMap.comprehensive.test.ts`**: Nhiều lỗi `TypeError: Expected an element or document but got Object` trong các bài kiểm thử xử lý lỗi và xác thực dữ liệu. Điều này cho thấy `waitFor` không tìm thấy các phần tử DOM mong đợi.
- [ ] **`tests/unit/useImageMap.comprehensive.test.ts`**: Logic thử lại (`retry`) không thành công, `hotspots` không được tải như mong đợi.

## 5. Lỗi cấu hình và kiến trúc kiểm thử

- [ ] **`package.json`**: Tập lệnh `test:playwright` trỏ đến một tệp cấu hình không tồn tại (`playwright.comprehensive.config.ts` thay vì `playwright.config.comprehensive.ts`).
- [ ] **`playwright.config.comprehensive.ts`**: Cấu hình sai khi định nghĩa một dự án `unit-tests` để chạy các tệp kiểm thử của Jest. Điều này gây ra lỗi `ReferenceError` vì môi trường Playwright không nhận dạng cú pháp của Jest. Cần tách biệt trình chạy Jest và Playwright.
