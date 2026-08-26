# 🎨 FORESIGHT LANDING PAGE UI/UX DESIGN SPECIFICATION (v1.0)
> **Inspiration:** [DreamDEX](https://www.dreamdex.io/) × Somnia Network High-Frequency Trading Aesthetic  
> **Target Audience:** Hackathon Judges (Somnia × DreamDEX / DoraHacks), Web3 Traders, Algo Developers  
> **Core Theme:** *Institutional AI Intelligence & Prediction Market Terminal*  
> **Primary Philosophy:** *"Understand the market before you trade it"* (30-second decision loop)

---

## 🌌 1. BẢNG MÀU & THIẾT KẾ NHẬN DIỆN (DESIGN SYSTEM & COLOR PALETTE)

Thiết kế kết hợp giữa phong cách **Dark Cybernetic** của DreamDEX và điểm nhấn **Neon Violet / Emerald / Rose** của ForeSight.

| Token | Giá Trị HEX / Tailwind | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| **Surface Dark (Base)** | `#07070A` / `#0A0A0F` | Nền trang chính với lưới ma trận chìm. |
| **Surface Card / Raised** | `#111118` / `#161622` | Nền các module, bảng điều khiển, thẻ tính năng. |
| **Border Default** | `#1F1F2E` / `#2A2A3D` | Đường viền kỹ thuật, phân cách bảng. |
| **Brand Accent (Primary)** | `#7C3AED` (Violet-600) / `#A78BFA` | Điểm nhấn chính, nút CTA, ánh sáng phát quang (glow). |
| **Somnia Green (Success)** | `#10B981` (Emerald-500) | Tín hiệu tăng giá, Alpha Bull, nút Buy YES, xác suất cao. |
| **Warning / Bear (Error)** | `#F43F5E` (Rose-500) | Tín hiệu giảm giá, Macro Bear, nút Buy NO. |
| **Data / Cyan Accent** | `#06B6D4` (Cyan-500) | Các chỉ số kỹ thuật, RAG citations, TPS counter. |
| **Text Heading** | `#FFFFFF` / `#F8FAFC` | Tiêu đề chính, phông Sans / Display sắc nét. |
| **Text Monospace** | `#94A3B8` / `#CBD5E1` | Nhãn dữ liệu, timestamp, code snippet, mã hợp đồng. |

---

## 📐 2. CẤU TRÚC PHÂN ĐOÀN LANDING PAGE (PAGE ARCHITECTURE)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. TOP MARQUEE TICKER TAPE (Live Somnia & DreamDEX Event Contracts)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. CYBER NAVIGATION BAR (Logo + Shannon Status + Launch CTA)          │
├────────────────────────────────────────────────────────────────────────┤
│ 3. 3D HERO SECTION                                                     │
│    ├─ Left: Headline, Value Proposition, Action Buttons                │
│    └─ Right: 3D Interactive Terminal Sandbox (Tilt Parallax + Sliders) │
├────────────────────────────────────────────────────────────────────────┤
│ 4. LIVE METRICS & PROOF BAR (100k TPS, 0ms Math, 100% RAG, 30s Loop)   │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE 4-STEP EXPERIENCE CAROUSEL/GRID (What Happened? → What Do I Do?)│
│    (Cyber Corner Brackets, Hover Scan Lines, Live Evidence Preview)    │
├────────────────────────────────────────────────────────────────────────┤
│ 6. ARCHITECTURE & SPEED BENCHMARK (ForeSight vs Black-box Bots)        │
├────────────────────────────────────────────────────────────────────────┤
│ 7. DEVELOPER & SDK INTEGRATION PREVIEW (@somnia-chain/markets-sdk)     │
├────────────────────────────────────────────────────────────────────────┤
│ 8. FOOTER & ECOSYSTEM BACKING (Somnia Shannon Testnet + DoraHacks)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🕹️ 3. CHI TIẾT CÁC ĐẶC ĐIỂM KẾ THỪA & NÂNG CẤP TỪ DREAMDEX

### 3.1 Live Running Marquee Ticker (Dải Ticker Chạy Vô Tận)
* **Vị trí:** Đặt ngay dưới Header hoặc sát đỉnh trang.
* **Hành vi:** Chạy mượt mà (`linear marquee animation`) với hiệu ứng fade mờ 2 bên mép (`mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)`).
* **Nội dung:** 
  * `BTC-0-26AUG26`: $0.62 `[+14.2% Spike]`
  * `ETH-STRIKE-2.5K`: $0.48 `[-3.5%]`
  * `SOMI/USDso`: $0.109 `[Somnia Native]`
  * `FED-RATE-CUT`: $0.78 `[High RAG Volume]`

### 3.2 3D Interactive Mouse Parallax (Hiệu Ứng Nghiêng 3D)
* **Cơ chế:** Tính toán tọa độ chuột $(m_x, m_y)$ tương đối với khung hình:
  ```css
  transform: perspective(1000px) rotateY(calc((var(--mx) - 0.5) * -6deg)) rotateX(calc((var(--my) - 0.5) * 4deg)) translate3d(calc((var(--mx) - 0.5) * 10px), calc((var(--my) - 0.5) * 6px), 0);
  ```
* **Ứng dụng:** Áp dụng trên Hero Mockup Card và 4 Thẻ User Journey để tạo chiều sâu thị giác khi di chuột.

### 3.3 Cyber Corner Brackets & Scanner Beam (Góc Kỹ Thuật & Tia Quét)
* **Visual:** Mỗi thẻ card trang bị 4 góc ngắm quang học:
  * `before: absolute top-2 left-2 size-2 border-t border-l border-violet-500`
  * `after: absolute bottom-2 right-2 size-2 border-b border-r border-violet-500`
* **Hiệu ứng:** Khi hover vào nút hoặc card, một vạch sáng mỏng quét dọc (`scan animation`) mang lại cảm giác radar / scanner hiện đại.

### 3.4 Interactive Mini-Sandbox Ngay Trên Hero (Live Demo 1-Chạm)
Thay vì chỉ là ảnh tĩnh, Hero Card cho phép tương tác trực tiếp:
* **Interactive Probability Curve:** Hover vào mốc spike hiển thị nhãn `⚡ 14:32 Spike (+14.2%)`.
* **Mini Bull vs Bear Toggle:** Bấm chuyển đổi để xem luận điểm AI RAG cập nhật tức thì.
* **Mini PnL Slider:** Kéo chọn vốn ($100 → $500) thấy PnL nhảy số thời gian thực không độ trễ (0ms).

### 3.5 Live Performance Stats (Metric Badges với Ping Pulses)
Khối số liệu thống kê thời gian thực với đèn tín hiệu ping phát sáng:
1. **$45.2M+** — Trailing Event Volume Tracked
2. **100K+ TPS** — Somnia Shannon CLOB Finality
3. **0ms** — Deterministic Scenario Math
4. **100%** — RAG Grounded Sources (Zero Black-Box)

---

## 💻 4. KẾ HOẠCH TÍCH HỢP CODE & COMPONENT

| Component / File | Trách Nhiệm Kỹ Thuật |
| :--- | :--- |
| [`LandingPage.tsx`](file:///D:/Coding/Somnia/src/ui/components/LandingPage.tsx) | Cập nhật cấu trúc toàn trang, thêm Mouse Move listener cho Parallax, tích hợp Sandbox. |
| [`MarketTicker.tsx`](file:///D:/Coding/Somnia/src/ui/components/MarketTicker.tsx) | Tái sử dụng hoặc nhúng Ticker marquee vào phần đầu Landing Page. |
| [`ui/index.css`](file:///D:/Coding/Somnia/src/ui/index.css) | Khai báo keyframes `scan`, `marquee`, `pulse-glow`, và các utility classes cho corner brackets. |

---

## 🎯 5. TIÊU CHÍ ĐÁNH GIÁ ĐẠT CHUẨN (SUCCESS CRITERIA)

* [ ] Hiệu năng mượt mà 60fps trên mọi trình duyệt, không gây giật lag.
* [ ] Tương thích responsive từ màn hình Mobile (375px) đến Desktop 4K.
* [ ] Thể hiện trọn vẹn thông điệp và 4 bước cốt lõi của ForeSight (*What Happened? → What Changed? → What If? → What Do I Do?*).
* [ ] Tông màu và bố cục đồng điệu tuyệt đối với hệ sinh thái DreamDEX & Somnia Network.
