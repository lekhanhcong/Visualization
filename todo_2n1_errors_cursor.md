# 📋 TODO LIST: 2N+1 REDUNDANCY VISUALIZATION - TOÀN DIỆN LỖI & TASK CHƯA HOÀN THÀNH

## 1. Kiến trúc & Clean Architecture
- [ ] **Duplicate Implementation**: Có 2 implementation RedundancyVisualization (src/components/RedundancyVisualization.tsx và features/redundancy/). Cần thống nhất 1 phiên bản duy nhất.
  - *Nguyên nhân:* Có 2 phiên bản phát triển song song.
  - *Tác động:* Gây nhầm lẫn, khó bảo trì, dễ lỗi khi cập nhật không đồng bộ.
  - *Ví dụ:* Sửa animation ở một file nhưng app lại dùng file còn lại.
  - *Gợi ý:* Xác định phiên bản chuẩn, loại bỏ/hợp nhất, cập nhật import/export toàn bộ dự án.
- [ ] **Separation of Concerns**: Một số logic animation, state, event xử lý còn lẫn lộn giữa các component (Overlay, Provider, Animation). Nên tách biệt rõ hơn.
  - *Nguyên nhân:* Component lớn kiêm nhiều vai trò.
  - *Tác động:* Khó test, khó mở rộng, dễ sinh bug khi thay đổi.
  - *Gợi ý:* Chia nhỏ component, tách riêng animation, state, event handler.
- [ ] **SOLID Violation**: Một số component (RedundancyProvider, Overlay) có nhiều trách nhiệm (state, animation, event, error). Nên tách nhỏ.
  - *Nguyên nhân:* Vi phạm nguyên lý Single Responsibility.
  - *Tác động:* Code phình to, khó test, khó refactor.
  - *Gợi ý:* Refactor thành các component nhỏ, mỗi component chỉ làm một việc.
- [ ] **Event Bus Coupling**: Event bus dùng chung cho nhiều component, cần kiểm tra lại mức độ coupling và isolation.
  - *Nguyên nhân:* Event bus không tách biệt domain.
  - *Tác động:* Một component lỗi có thể ảnh hưởng toàn bộ hệ thống.
  - *Gợi ý:* Tách event bus theo domain, hoặc dùng event isolation/circuit breaker.

## 2. Bảo mật & Input Validation
- [ ] **Thiếu Input Validation**: Các props, config truyền vào component chưa kiểm tra/sanitization đầy đủ (đặc biệt với config từ bên ngoài hoặc dynamic).
  - *Nguyên nhân:* Không kiểm tra kiểu dữ liệu, giá trị input.
  - *Tác động:* Dễ bị crash, hoặc bị tấn công nếu nhận dữ liệu không hợp lệ.
  - *Ví dụ:* Truyền config từ API mà không kiểm tra, có thể gây lỗi runtime.
  - *Gợi ý:* Dùng schema validation (zod, yup), kiểm tra kỹ mọi input.
- [ ] **OWASP Compliance**: Chưa có kiểm tra cụ thể về XSS, CSRF, hoặc các lỗ hổng injection khi nhận dữ liệu từ API hoặc user input.
  - *Nguyên nhân:* Chưa có kiểm tra bảo mật đầu vào.
  - *Tác động:* Có thể bị tấn công nếu app nhận dữ liệu từ user hoặc API không an toàn.
  - *Gợi ý:* Escape mọi dữ liệu render ra UI, không trust input, dùng các thư viện bảo mật.
- [ ] **Error Handling**: Mặc dù có ErrorBoundary, nhưng chưa có structured logging hoặc alerting cho lỗi nghiêm trọng.
  - *Nguyên nhân:* ErrorBoundary chỉ bắt lỗi UI, chưa có logging/alerting structured.
  - *Tác động:* Lỗi nghiêm trọng không được phát hiện sớm, khó debug.
  - *Gợi ý:* Thêm logging (Sentry, LogRocket), gửi alert khi có lỗi nghiêm trọng.

## 3. Hiệu năng & Memory Leak
- [ ] **Memory Leak Risk**: Animation sử dụng setTimeout, requestAnimationFrame, cần kiểm tra cleanup kỹ hơn khi component unmount hoặc rapid show/hide.
  - *Nguyên nhân:* Sử dụng timer/animation nhưng cleanup chưa triệt để.
  - *Tác động:* Dùng lâu sẽ tăng memory, app chậm dần hoặc crash.
  - *Ví dụ:* Đóng/mở overlay nhiều lần mà không clear timeout/animation.
  - *Gợi ý:* Cleanup toàn bộ timer, animation khi unmount hoặc khi không còn cần thiết.
- [ ] **Large Dataset Stress**: Chưa có test thực tế với dataset cực lớn (hàng trăm substation/line) để kiểm tra hiệu năng thực tế.
  - *Nguyên nhân:* Chưa test với dữ liệu lớn.
  - *Tác động:* Có thể lag, crash khi triển khai thực tế.
  - *Gợi ý:* Tạo test case với hàng trăm node, đo hiệu năng, tối ưu render.
- [ ] **Performance Optimization**: Một số animation chưa tối ưu cho thiết bị yếu hoặc khi bật reduced motion.
  - *Nguyên nhân:* Animation chưa tối ưu cho thiết bị yếu, chưa tôn trọng reduced motion.
  - *Tác động:* Người dùng thiết bị yếu hoặc cần accessibility sẽ gặp khó khăn.
  - *Gợi ý:* Tối ưu animation, kiểm tra reduced motion, lazy load, giảm số lượng particle.

## 4. Accessibility (WCAG, Screen Reader)
- [ ] **ARIA Label Consistency**: Một số component chưa có aria-label hoặc aria-describedby đầy đủ (ví dụ InfoPanel, Overlay).
  - *Nguyên nhân:* Thiếu ARIA cho thành phần tương tác.
  - *Tác động:* Screen reader không đọc được nội dung, vi phạm WCAG.
  - *Gợi ý:* Bổ sung đầy đủ ARIA cho mọi thành phần tương tác.
- [ ] **Focus Management**: Cần kiểm tra kỹ hơn việc focus trap trong modal/overlay, đặc biệt khi dùng keyboard navigation.
  - *Nguyên nhân:* Modal/overlay chưa trap focus, hoặc mất focus khi đóng/mở.
  - *Tác động:* Người dùng keyboard không thể thao tác mượt mà.
  - *Gợi ý:* Dùng focus trap, trả focus về button khi đóng overlay.
- [ ] **Screen Reader**: Chưa có test thực tế với các screen reader phổ biến (NVDA, JAWS, VoiceOver), chỉ mới test tự động.
  - *Nguyên nhân:* Chưa test thực tế với các screen reader phổ biến.
  - *Tác động:* Có thể có lỗi không phát hiện qua test tự động.
  - *Gợi ý:* Test thủ công với NVDA, JAWS, VoiceOver.
- [ ] **Color Contrast**: Cần kiểm tra lại contrast thực tế trên nhiều nền màu và chế độ high contrast.
  - *Nguyên nhân:* Chưa kiểm tra contrast trên nhiều nền màu.
  - *Tác động:* Người khiếm thị màu sẽ khó nhìn.
  - *Gợi ý:* Dùng tool kiểm tra contrast, điều chỉnh màu cho đủ chuẩn AA/AAA.

## 5. Test Coverage & Automation
- [ ] **Unit Test Coverage < 80%**: Một số component, utils, event bus chưa đủ coverage (theo báo cáo).
  - *Nguyên nhân:* Một số file, utils, event bus chưa có test hoặc test chưa đủ case.
  - *Tác động:* Dễ phát sinh bug khi refactor.
  - *Gợi ý:* Bổ sung test cho mọi logic, edge case.
- [ ] **Integration Test**: Một số workflow phức tạp (failover, error recovery) chưa có test integration đầy đủ.
  - *Nguyên nhân:* Workflow phức tạp chưa có test tích hợp.
  - *Tác động:* Dễ lỗi khi các component phối hợp với nhau.
  - *Gợi ý:* Viết test cho failover, error recovery, event bus.
- [ ] **E2E Test**: Một số test E2E chỉ là placeholder/chưa hoàn thiện (xem __tests__/e2e/redundancy-workflow.test.ts).
  - *Nguyên nhân:* Một số test chỉ là placeholder, chưa kiểm tra thực tế.
  - *Tác động:* Không phát hiện được bug UI/UX thực tế.
  - *Gợi ý:* Hoàn thiện các test E2E, mô phỏng hành vi người dùng.
- [ ] **Performance Test**: Chưa có test tự động cho memory leak, stress test với rapid show/hide cycles.
  - *Nguyên nhân:* Chưa có test tự động cho memory leak, stress test.
  - *Tác động:* Không phát hiện được memory leak, lag khi sử dụng lâu.
  - *Gợi ý:* Viết test mở/đóng overlay liên tục, đo memory.
- [ ] **Visual Regression**: Chưa có baseline cho mọi viewport, cần bổ sung thêm snapshot cho mobile/tablet.
  - *Nguyên nhân:* Chưa có snapshot cho mọi viewport.
  - *Tác động:* UI có thể bị vỡ trên mobile/tablet mà không phát hiện.
  - *Gợi ý:* Bổ sung snapshot cho nhiều kích thước màn hình.

## 6. Cấu hình & Tài liệu
- [ ] **Config Inconsistency**: Có sự khác biệt giữa config trong config.ts và defaultConfig trong Provider (ví dụ capacity, radius, v.v.).
  - *Nguyên nhân:* Config ở nhiều nơi khác nhau, giá trị không đồng nhất.
  - *Tác động:* Dễ gây bug, khó debug khi config bị lệch.
  - *Gợi ý:* Đồng bộ config, chỉ định 1 nguồn config duy nhất.
- [ ] **Thiếu tài liệu chi tiết cho API, event bus, error isolation**.
  - *Nguyên nhân:* API, event bus, error isolation chưa có tài liệu chi tiết.
  - *Tác động:* Khó cho dev mới, khó bảo trì.
  - *Gợi ý:* Viết doc cho từng module, flow, event.

## 7. Rủi ro & Đề xuất
- [ ] **Rủi ro khi mở rộng**: Kiến trúc hiện tại có thể khó mở rộng cho các loại redundancy khác (N+1, 3N, custom...)
  - *Nguyên nhân:* Kiến trúc hiện tại chỉ phù hợp 2N+1, khó mở rộng cho N+1, 3N, custom.
  - *Tác động:* Khi có yêu cầu mới phải refactor lớn.
  - *Gợi ý:* Refactor theo hướng generic, dùng strategy pattern cho redundancy type.
- [ ] **Thiếu feature flag cho từng sub-feature**: Hiện chỉ có 1 flag tổng, nên tách nhỏ hơn cho từng phần (animation, info panel, event bus...)
  - *Nguyên nhân:* Chỉ có 1 flag tổng, không kiểm soát được từng phần nhỏ.
  - *Tác động:* Không thể bật/tắt từng tính năng nhỏ để test/triển khai dần.
  - *Gợi ý:* Tách nhỏ flag cho animation, info panel, event bus, v.v.

---

## 📌 Checklist Task Chưa Hoàn Thành

- [ ] Thống nhất và loại bỏ duplicate implementation RedundancyVisualization
- [ ] Refactor separation of concerns cho Overlay, Provider, Animation
- [ ] Bổ sung input validation cho mọi config, props nhận từ ngoài
- [ ] Kiểm tra và bổ sung structured error logging, alerting
- [ ] Thực hiện stress test với dataset lớn và rapid show/hide cycles
- [ ] Bổ sung test thực tế với screen reader phổ biến
- [ ] Đảm bảo đủ 80%+ unit test coverage cho mọi component, utils
- [ ] Bổ sung integration test cho failover, error recovery
- [ ] Hoàn thiện các E2E test còn là placeholder
- [ ] Bổ sung visual regression snapshot cho mọi viewport
- [ ] Kiểm tra và đồng bộ lại config giữa các file
- [ ] Bổ sung tài liệu chi tiết cho API, event bus, error isolation
- [ ] Đề xuất refactor kiến trúc cho khả năng mở rộng redundancy type
- [ ] Tách nhỏ feature flag cho từng sub-feature

---

> **Lưu ý:** Checklist này tổng hợp từ kiểm tra code, test, tài liệu, và các báo cáo tự động/manual. Các task [ ] là chưa hoàn thành hoặc còn tồn tại lỗi/rủi ro. Nên review định kỳ và cập nhật khi hoàn thành. 