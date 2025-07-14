2N+1 REDUNDANCY FEATURE
MỤC TIÊU CỦA FEATURE
Mục tiêu chính:
Thể hiện trực quan và ấn tượng khái niệm 2N+1 Redundancy cho nhà đầu tư quốc tế, giúp họ hiểu ngay lập tức rằng Data Center 300MW có hạ tầng điện với độ tin cậy tuyệt đối.

Mục tiêu cụ thể:
Visualize Infrastructure Scale: 4 nguồn 500kV + 2 trạm biến áp = 1,200MW capacity
Build Investor Confidence: Zero downtime capability với visual proof
Simplify Complex Concept: 30 giây để hiểu hoàn toàn
Professional Presentation Tool: Reduce technical Q&A time
CORE ELEMENTS - SIMPLE BUT COMPLETE
1. Interactive Elements
1 Button: "Show 2N+1 Redundancy" (bottom right)
1 Main View: Overlay visualization
1 Info Panel: Key statistics (top right)
Close Action: Click outside hoặc X button
2. Visual Components - BASED ON EXISTING MAP
A. HIGHLIGHT 4 ĐƯỜNG 500KV TỪ HÌNH CÓ SẴN
QUAN TRỌNG: Tất cả là EXISTING RED LINES trong hình - chỉ highlight, không vẽ mới!

Active Lines (Apply RED GLOW to existing lines):

Line 1: Trace đường đỏ từ label "TẢ TRẠCH HYDRO POWER PLANT" → "500/220KV SUBSTATION"
Line 2: Trace đường đỏ từ góc Tây (below Line 1) → merge với Line 1 trước khi vào substation
Standby Lines (Apply YELLOW GLOW to existing lines):

Line 3: Trace đường đỏ từ nhóm "EXISTING 500KV LINES" phía Bắc → đến vị trí Substation 02
Line 4: Trace đường đỏ từ phía Đông Nam → đến vị trí Substation 02
Visual Effect:

Glow overlay on SPECIFIC SEGMENTS của existing lines
Other red lines: dim xuống 30% opacity
Result: 4 lines nổi bật từ existing infrastructure
B. 2 TRẠM BIẾN ÁP
Substation 01 (ĐÃ CÓ TRONG HÌNH):

Position: Exact location của "500/220KV SUBSTATION" label
Visual: Add RED marker overlay + glow
Keep existing label, add status: "ACTIVE"
Substation 02 (THÊM MỚI):

Position: Trong green boundary, ~800m Đông Nam của Sub 01
Visual: YELLOW marker + glow
Label: "SUBSTATION 02 - 600MW STANDBY"
Connect to nearby existing red lines
C. INTERCONNECTION
Draw NEW purple line giữa 2 substations (line này không có sẵn)
Label: "220kV Backup Connection"
3. Information Display
Simple Info Panel:
2N+1 POWER REDUNDANCY
━━━━━━━━━━━━━━━━━━━━━━
Data Center Needs: 300MW

Active Now:
- Quảng Trạch: 300MW ✓
- Thanh Mỹ: 300MW ✓
Total: 600MW (200%)

Standby Ready:
- Quảng Trị: 300MW
- Đà Nẵng: 300MW  
Total: 600MW (200%)

Status: 400% TOTAL CAPACITY
4. Animation (Simple nhưng Pro)
Power flow: Dashed lines chạy trên active routes
Pulse effect: Substations nhẹ nhàng pulse
Sequential reveal: Elements xuất hiện theo thứ tự
Smooth transitions: Professional feel
USER EXPERIENCE - STREAMLINED
Click Flow (Total: 15-20 seconds)
Click button → Overlay appears
See infrastructure → 4 lines + 2 substations
Read statistics → Understand scale
Watch animation → See it working
Close → Back to normal
Visual Sequence:
0-1s: Background dims, overlay fades in
1-2s: 4 lines highlight với labels
2-3s: 2 substations appear với connection
3-4s: Info panel slides in
4s+: Power flow animation starts
IMPLEMENTATION APPROACH - DỰA TRÊN HÌNH CÓ SẴN
1. NGUYÊN TẮC QUAN TRỌNG
KHÔNG VẼ LẠI - CHỈ HIGHLIGHT ĐƯỜNG CÓ SẴN

Base map với các đường điện GIỮ NGUYÊN
Chỉ thêm OVERLAY effects lên trên
Highlight các segments cụ thể của existing lines
KHÔNG create new paths
2. Cách Highlight Existing Lines
Approach 1: CSS Overlay Effects

- Identify exact segments của red lines (500kV) trên map
- Apply glow effect CHỈ cho 4 segments cần highlight:
  + 2 segments phía Tây → Sub 01 (glow ĐỎ)
  + 2 segments phía Đông → Sub 02 (glow VÀNG)
- Dim các lines khác để tạo contrast
Approach 2: SVG Trace Method

- Trace EXACTLY theo path của existing red lines
- Create transparent SVG paths overlay
- Apply styling CHỈ cho traced paths
- Perfect alignment với lines gốc
3. Line Identification từ Hình
Cần xác định chính xác:

Segment 1: Đường đỏ từ góc Tây Bắc → trạm existing
Segment 2: Đường đỏ từ góc Tây → merge với segment 1
Segment 3: Đường đỏ từ nhóm lines phía Bắc → vị trí Sub 02
Segment 4: Đường đỏ từ phía Đông Nam → vị trí Sub 02
Note: Tất cả đều là EXISTING LINES trong hình - KHÔNG vẽ mới!

4. Substation Positioning
Substation 01:

Đã có trong hình với label rõ ràng
Chỉ cần add marker overlay tại vị trí exact
Substation 02:

Vị trí: Trong green boundary, phía Đông Nam
Marker overlay mới (không có sẵn trong hình)
Connect với existing lines gần đó
5. Technical Implementation
Layer Stack:
1. Original Map Image (untouched)
2. Dim Overlay (semi-transparent black)
3. Line Highlights (glow on specific segments)
4. Substation Markers (2 positions)
5. Labels & Info Panel (floating elements)
CRITICAL REQUIREMENTS
MUST Have:
✅ 2 Substations rõ ràng - không thể thiếu Sub 02
✅ 4 specific lines highlighted - đúng nguồn
✅ Clear capacity numbers - 300MW x 4 = 1,200MW
✅ Professional appearance - no amateur effects
✅ Mobile responsive - works on tablets
DON'T Need:
❌ Multiple scenarios
❌ Failure simulations
❌ Complex interactions
❌ Technical jargon overload
❌ Configuration options
SUCCESS CRITERIA
Visual Impact:
Investors see "4 independent sources" immediately
Understand "2 separate substations" clearly
Grasp "400% capacity" without explanation
Technical Execution:
Loads in <1 second
Animations at 60fps
Works on all devices
Zero bugs in demos
Business Value:
Reduces infrastructure Q&A by 80%
Increases confidence scores
Differentiates from competitors
Closes deals faster
FINAL IMPLEMENTATION CHECKLIST
Phase 1: Setup (2 hours)
 Create overlay component
 Add button trigger
 Setup basic structure
Phase 2: Visuals (4 hours)
 Highlight correct line segments
 Add both substation markers
 Create interconnection line
 Style with glow effects
Phase 3: Information (2 hours)
 Design info panel
 Add statistics
 Create labels
Phase 4: Animation (2 hours)
 Power flow effect
 Sequential reveals
 Smooth transitions
Phase 5: Polish (2 hours)
 Responsive testing
 Performance optimization
 Final touches
Total: ~12 hours implementation

SUMMARY
This feature is SIMPLE in interaction but COMPLETE in information:

Shows all 4 sources clearly
Displays both substations prominently
Communicates 2N+1 concept visually
Professional execution throughout
Not too simple, not too complex - just right for impressing investors!

