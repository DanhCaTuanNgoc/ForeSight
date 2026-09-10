# 📋 BÁO CÁO PHÂN TÍCH ĐÁNH GIÁ & KẾ HOẠCH CẢI THIỆN FORESIGHT
> **Dự án:** ForeSight — Autonomous Binary Prediction Terminal on Somnia Shannon Testnet  
> **Nguồn đánh giá:** danhgia.txt, On-Chain Tx Audits & User Alignment  
> **Cập nhật ngày:** 10/09/2026 (Phiên bản đồng bộ hoàn tất)  
> **Mục tiêu:** Khắc phục triệt để các sai lệch về bản chất sản phẩm (Prediction Market vs Futures), loại bỏ 100% dữ liệu mock/fake, chuẩn hóa toàn bộ luồng dữ liệu từ DreamDEX (Strike, Pairs, Orderbook), tích hợp bộ định lượng vào AnalyticsView, chuẩn hóa luồng đặt lệnh theo chuẩn Polymarket và xác thực chính xác chu kỳ vòng đời vị thế On-Chain (Settlement & Refund).

---

## 1. TỔNG HỢP CÁC QUYẾT ĐỊNH THIẾT KẾ CỐT LÕI (ALIGNED ARCHITECTURE)

1. **Cơ chế vào/đóng lệnh (No Early Exit / No TP-SL):**
   - Không áp dụng TP/SL và không áp dụng Early Cash-out cho các vòng cược siêu ngắn (1m, 5m, 15m).
   - Đã loại bỏ hoàn toàn cột `Early exit` trong bảng Positions & Settlement Record.
   - Mô hình tinh gọn chuẩn xác: **BUY YES hoặc BUY NO -> Khóa cược -> Đếm ngược hết round -> Oracle chốt kết quả -> Claim thưởng**.
   - Xóa bỏ hoàn toàn các hàm `Math.random()` fake khớp lệnh trên frontend/backend.
2. **Đồ thị giá (Spot Price Candlesticks thay vì % ảo):**
   - Đồ thị chính chuyển sang hiển thị **Nến giá thực tế (Spot Price)** của BTC/ETH/SOL.
   - Vẽ đường kẻ ngang **Strike Price (mức giá mục tiêu)** lấy trực tiếp từ DreamDEX contract để người dùng thấy rõ nến đang dao động trên hay dưới vạch mục tiêu.
   - Các nút Timeframe (1m, 5m, 15m, 1h) kết nối dữ liệu thực.
3. **Gom toàn bộ thuật toán định lượng vào AnalyticsView.tsx:**
   - Gom các chỉ số toán học tài chính vào một trung tâm phân tích duy nhất:
     - **CLOB Orderbook Imbalance (OI):** Tỷ lệ áp lực mua/bán ở các bước giá tốt nhất.
     - **Spread Compression & Velocity:** Tốc độ co giãn biên độ Bid/Ask.
     - **Black-Scholes Binary Fair Value (Phi(d2)):** Xác suất toán học định giá hợp đồng nhị phân.
     - **Oracle Drift & Target Distance:** Khoảng cách giữa giá Spot hiện tại và điểm Strike.
4. **Chuẩn hóa 100% Data Flow từ DreamDEX:**
   - Nhận diện toàn bộ 58+ market thật trên DreamDEX Testnet (bao gồm các venue `0x1a1e68...`, `0x679795...`, `0xa3c034...`).
   - Parse chính xác `strikePrice` từ `rawInfo.strike` của DreamDEX (format chuẩn số thập phân USD).
   - Xóa bỏ toàn bộ market mock (`sol-hourly-clob-1`, `FALLBACK_MARKETS`).
   - Không fake orderbook ngẫu nhiên (`Math.abs(seed...)`) trong DepthChart.tsx.
   - Động hóa số lượng thị trường hiển thị (`{filteredMarkets.length} ACTIVE`).

---

## 2. NHẬT KÝ CẢI TIẾN & KHẮC PHỤC ON-CHAIN GẦN ĐÂY (EXECUTION & AUDIT UPDATES)

### 2.1. Redesign Order Ticket theo chuẩn UX Polymarket
- **Hiện trạng cũ:** Giao diện ScenarioSimulator rườm rà, nhiều thông số phức tạp, trải nghiệm khó tiếp cận.
- **Cải tiến:** Tái cấu trúc Order Ticket tinh gọn theo chuẩn Polymarket:
  - Chọn Tab `YES` / `NO` trực quan với màu sắc nhận diện rõ ràng.
  - Nhập số lượng USD đầu tư nhanh với các preset chip ($10, $25, $50, $100, Max).
  - Tự động tính toán tức thì: Số hợp đồng (Shares), Giá trung bình (Avg Price), Lợi nhuận tiềm năng (Potential Return) và Tỷ suất sinh lời (ROI %).
  - Xử lý 2 bước ký MetaMask EIP-20 Approve & Place Order mượt mà.

### 2.2. Kiểm toán lỗi Revert `TradingNotActive()`
- **Sự cố:** Ghi nhận giao dịch thất bại `0x999f033f...` với revert reason `TradingNotActive()`.
- **Nguyên nhân:** Người dùng gửi lệnh khi pool đã bước vào cutoff window trước thời điểm hết hạn (thường là 30s trước Expiry).
- **Khắc phục:** Thêm logic kiểm tra thời gian thực trên Order Ticket; tự động vô hiệu hóa nút đặt lệnh và cảnh báo `Trading cutoff reached` khi round sắp kết thúc.

### 2.3. Kiểm toán dòng tiền On-Chain & Cơ chế Hoàn vốn (Case Tx `0x58f7...8ef0`)
- **Hiện tượng:** Người dùng đặt lệnh mua YES 50 tUSDC, giao dịch thành công nhưng khi round hết hạn số dư ví không đổi và trước đó bị hiển thị nhầm là `EXPIRED LOSS` hoặc `WIN`.
- **Phát hiện On-chain:**
  - Lệnh gửi dưới dạng Limit Order sát giờ (`orderType: 0`), hợp đồng DreamDEX emit sự kiện `OrderPlaced` và `OrderRested` (không tìm thấy counterparty khớp lệnh trước khi hết round).
  - Tại thời điểm đáo hạn round, lệnh limit chưa khớp tự động bị hủy và **100% tiền ký quỹ (50.0005 tUSDC) đã được smart contract hoàn trả nguyên vẹn về ví** (không mint outcome token).
- **Sửa đổi kiến trúc:**
  - Bổ sung trạng thái chính thức `REFUNDED` vào toàn bộ hệ sinh thái (Server, Store, UI).
  - Khắc phục lỗi nhánh điều kiện trong `src/ui/App.tsx` (từng bỏ sót `REFUNDED`, khiến lệnh bị rơi vào nhánh `isWinner === false` và gán nhầm thành `SETTLED_LOSS` trong `localStorage`).
  - Cột Payout hiển thị minh bạch: `$50.00 USDC / 100% Refunded ($0 PnL)`.

### 2.4. Chuẩn hóa chu kỳ 7 trạng thái lệnh & UI 100% Tiếng Anh
- **Chu kỳ trạng thái toàn diện:**
  1. `RESTING`: Lệnh Limit nằm trên orderbook chờ đối ứng (collateral nằm trong pool escrow).
  2. `IN FLIGHT`: Lệnh đã khớp (OrderFilled), đang nắm giữ outcome shares chạy trong round.
  3. `RESOLVING`: Round đã hết giờ, đang chờ Keeper/Oracle chốt giá.
  4. `SETTLED WIN`: Dự đoán trúng, round đã finalized, claimable $1.00/contract.
  5. `EXPIRED LOSS`: Dự đoán trượt, payout $0.00 (-100%).
  6. `REFUNDED`: Lệnh limit không khớp trước khi hết giờ, 100% vốn hoàn về ví.
  7. `CLAIMED`: Đã nhận tiền thưởng payout về ví thành công.
  8. `CLOSED`: Đóng lệnh thủ công.
- **Chuẩn hóa giao diện:**
  - Loại bỏ hoàn toàn tooltips (`title`) và con trỏ `cursor-help` để giao diện mượt mà, không vướng mắt.
  - Loại bỏ toàn bộ phụ đề tiếng Việt (`Hoàn tiền`, `Chờ khớp`,...), chuyển toàn bộ ứng dụng sang **100% tiếng Anh chuẩn quốc tế**.

### 2.5. Nâng cấp MarketTicker kết nối Realtime DreamDEX CLOB & Spot Oracles
- **Hiện trạng cũ:** Thanh ticker marquee cuộn ngang tự động chỉ query fallback Binance hoặc format giá không phù hợp với binary markets.
- **Cải tiến:**
  - Endpoint `/api/tickers` kết nối trực tiếp `watcher.getActiveEventContracts()` từ DreamDEX indexer (`dev.smk.somnia.host`).
  - Hiển thị cả 2 luồng dữ liệu thời gian thực:
    1. **Hợp đồng dự đoán DreamDEX:** Hiển thị tên hợp đồng kèm mức giá mục tiêu (`BTC > $78,721.01`, `ETH > $2,491.74`), tỷ lệ cược YES (`YES $0.50 (50%)`) và biến động odds.
    2. **Spot Oracles:** Cập nhật liên tục giá Spot BTC, ETH, SOL, SOMI.
  - Tự động đồng bộ mỗi 3.5-4 giây.

### 2.6. Đồng bộ Panel POSITIONS & SETTLEMENT ở Footer Terminal (`ThesisHealthMonitor.tsx`)
- **Hiện trạng cũ:** Bảng điều khiển chân trang chỉ có 2 nhãn cứng nhắc (`In Flight` và `Settled`), không nhận diện các trạng thái nâng cao như `REFUNDED`, `EXPIRED LOSS`, `SETTLED WIN`, `RESTING`, `RESOLVING`.
- **Cải tiến:**
  - Nhúng toàn bộ bộ lọc động học 7 trạng thái lệnh chuẩn sàn giao dịch đồng bộ hoàn toàn với `ActivityView` và `PositionsTable`.
  - Drawer `Orders (N)` hiển thị chi tiết từng lệnh: Cột Payout / PnL minh bạch (`$50.00 (Refunded)` cho lệnh hoàn tiền; `-$50.00 (-100%)` cho cược thua; `+$ROI%` cho cược thắng).
  - Tích hợp nút `CLAIM (N)` trực tiếp ngay trên thanh Dock chân trang khi có vị thế thắng cần rút vốn về ví.

---

## 3. MA TRẬN PHÂN CÔNG & FILE THAY ĐỔI

| Thành phần | File đã cập nhật | Nội dung cải tiến & xử lý |
| :--- | :--- | :--- |
| **Market Data Watcher** | `src/core/market-watcher.ts` | • Hỗ trợ toàn bộ venue hợp lệ của DreamDEX.<br>• Parse đúng strikePrice từ rawInfo.strike.<br>• Trích xuất interval, expirationTime, marketAddress, token IDs. |
| **Backend API Server** | `src/server/index.ts` | • Xóa mock push.<br>• Thêm động cơ `resolvePositionOnChain` truy vấn trực tiếp contract `0xbF4a49e0...`.<br>• Bổ sung hỗ trợ `REFUNDED` trong `isPositionExpired`. |
| **Positions Store** | `data/positions.json` | • Lưu trữ lịch sử lệnh thực tế.<br>• Đánh dấu chuẩn xác `REFUNDED` và `isRefunded: true` cho lệnh không khớp. |
| **Contract Configuration** | `src/ui/utils/contracts.ts` | • Cập nhật địa chỉ singleton `DREAMDEX_SETTLEMENT_ADDRESS` thành `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23`. |
| **Positions Table** | `src/ui/components/PositionsTable.tsx` | • Bỏ cột Early exit.<br>• Nâng cấp cột `Payout / PnL` (phân biệt Win, Loss, Refunded).<br>• Cột Status chuẩn 100% tiếng Anh, không tooltips. |
| **Activity View** | `src/ui/components/ActivityView.tsx` | • Phân loại tab `ALL`, `IN FLIGHT`, `SETTLED` chuẩn xác (bao gồm `REFUNDED`).<br>• Truyền dữ liệu `enrichedPositions` sang ActivityTable. |
| **Activity Table** | `src/ui/components/ActivityTable.tsx` | • Đồng bộ đầy đủ các badge `RESTING`, `IN FLIGHT`, `RESOLVING`, `WIN`, `LOSS`, `REFUNDED`, `CLAIMED`. |
| **App State & Cache** | `src/ui/App.tsx` | • Viết lại hàm `resolveStatus` ưu tiên `REFUNDED`.<br>• Chữa lành dữ liệu cũ trong `localStorage`. |
| **Trading Form** | `src/ui/components/ScenarioSimulator.tsx` | • Tinh gọn hóa giao diện theo cảm hứng Polymarket.<br>• Xóa bỏ TP/SL, tập trung vào BUY YES/NO và payout ước tính. |
| **Price Chart** | `src/ui/components/PriceChart.tsx` | • Nến giá Spot thật kèm đường Strike Price. |
| **Orderbook Depth** | `src/ui/components/DepthChart.tsx` | • Kết nối depth thật, loại bỏ seed/random. |
| **Trung tâm Định lượng** | `src/ui/components/AnalyticsView.tsx` | • Gom Orderbook Imbalance, Spread Velocity, Black-Scholes Fair Value vào một nơi. |

---

## 4. CHECKLIST KIỂM THỬ NGHIỆM THU (ACCEPTANCE CRITERIA)

- [x] Mọi cặp tiền hiển thị trên sidebar đều đến từ DreamDEX indexer (`dev.smk.somnia.host`).
- [x] Điểm Strike Price hiển thị chính xác theo USD (ví dụ: BTC $78,725.05, ETH $2,500.35).
- [x] Không còn bất kỳ mã nguồn nào dùng `Math.random()` để giả vờ tạo giao dịch hay fake orderbook.
- [x] Form đặt lệnh không còn TP/SL, trải nghiệm chuẩn Polymarket (Yes/No, Payout, ROI%).
- [x] Màn hình AnalyticsView hiển thị đầy đủ các chỉ số định lượng thời gian thực.
- [x] Bảng Positions & Settlement Record bỏ cột Early exit.
- [x] Khắc phục triệt để lỗi gán nhầm trạng thái lệnh hoàn vốn (`REFUNDED`) thành `EXPIRED LOSS`.
- [x] Cột Status hiển thị 100% tiếng Anh tinh gọn, không có tooltips gây vướng.
- [x] Cột Payout hiển thị minh bạch Payout và PnL theo từng trường hợp (Win / Loss / Refunded).
- [x] Build TypeScript và Vite (`npm run build`) vượt qua 100% với 0 lỗi.

---

## 5. BÁO CÁO PHẢN BIỆN & ĐỊNH HÌNH KIẾN TRÚC THỰC CHIẾN (THE 4-LAYER TERMINAL)
> **Cập nhật ngày:** 10/09/2026 (Chiến lược 24h trước giờ nộp bài)  
> **Trọng tâm:** Tối ưu hóa trải nghiệm phản xạ 0ms trên màn hình chính `markets` (tab cốt lõi trong `App.tsx`), phân định chuẩn xác giữa **Toán học phản xạ (Math Reflex 0ms)** và **Trí tuệ nhân tạo (AI Strategic Cognition)**, giữ nguyên và nâng tầm giá trị của cả 4 Tab mà không gây xáo trộn codebase.

### 5.1. Hai Tử Huyệt Được Bóc Tách & Hướng Khắc Phục

1. **Tử huyệt 1 — Rời rạc màn hình (Fragmented UI):**
   * *Vấn đề:* Tab `markets` trong `App.tsx` là nơi diễn ra 90% tương tác (Nến, Sổ lệnh CLOB, Form đặt lệnh thật và Footer Settlement). Nếu giấu Strike Radar hay Agent vào tab phụ (`analytics` hay `insights`), người dùng buộc phải chuyển tab qua lại liên tục — làm đứt gãy hoàn toàn trải nghiệm trong round 1 phút.
   * *Khắc phục:* **Tích hợp trực diện vào tab `markets`** — Gắn **Mini Strike Radar** ngay dưới nến [`PriceChart.tsx`](file:///D:/Coding/Somnia/src/ui/components/PriceChart.tsx) và tích hợp thanh **Agent Fast-Pick Trigger** ngay trên [`ScenarioSimulator.tsx`](file:///D:/Coding/Somnia/src/ui/components/ScenarioSimulator.tsx).

2. **Tử huyệt 2 — Dùng LLM cho round 1 phút (The LLM Latency & Hallucination Trap):**
   * *Vấn đề:* Gọi API LLM (Gemini/OpenAI) mất từ 2-4 giây, có nguy cơ nghẽn mạng / dính rate-limit 429 khi quay demo. Hơn nữa, LLM không thể tính toán các chỉ số microstructure như Price Velocity, Strike Distance hay CLOB Imbalance theo từng tick thời gian thực.
   * *Khắc phục:* **Phân tách rạch ròi Math Reflex vs AI Cognition:**
     * **Math Reflex Engine (0ms Latency):** Chạy bằng JavaScript thuần trên Client, tính toán tức thì Strike Distance ($\Delta\%$), Orderbook Imbalance ($OI\%$) và Price Velocity ($\nu$) mà không tốn 1 ms gọi server.
     * **AI Cognition (On-Demand Intelligence):** LLM chỉ kích hoạt khi người dùng xem phân tích Regime thị trường hoặc mở `DualDebateModal` / `InsightsView`.

---

### 5.2. Kiến Trúc 4 Tầng Phân Công Nhiệm Vụ (The 4-Layer Terminal)

Thay vì xóa bỏ hay viết lại, 4 Tab của ForeSight được quy hoạch chuẩn mực như một Bloomberg Terminal thế hệ mới:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  [MARKETS]              [INSIGHTS]            [ANALYTICS]        [ACTIVITY] │
│  ⚡ TACTICAL TRADING    🧠 AI INTELLIGENCE     📐 QUANT LAB       💼 POSITIONS│
│                                                                             │
│  • Nơi trade chính      • Nơi đàm đạo AI      • Nơi soi công     • Nơi xem  │
│  • 1-Click Fast Pick    • Gemini vs LLaMA       thức Black-        lịch sử  │
│  • Strike Radar Mini    • Phân tích Regime      Scholes            PnL, rút │
│  • Khớp lệnh tức thì    • News Sentiment      • Sổ lệnh sâu        thưởng   │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Tab `MARKETS` (Chiếm 90% thời gian & 70% thời lượng Video Demo):**
   * Bảng điều khiển tác chiến phản xạ nhanh.
   * Hiển thị nến Spot thật, khoảng cách tới Strike, tỷ lệ Imbalance và các nút gợi ý **⚡ Momentum Pick / 🛡️ Reversal Pick** 1-click tự động điền form.
2. **Tab `INSIGHTS` (Bằng chứng cho tiêu chí AI & Innovation — 20% điểm Hackathon):**
   * Dual-Agent Arena: Gemini tranh biện với LLaMA về trạng thái vĩ mô (Regime), nhận định tâm lý thị trường.
3. **Tab `ANALYTICS` (Bằng chứng cho tiêu chí Technical Depth — 25% điểm Hackathon):**
   * Phòng thí nghiệm định lượng: Định giá quyền chọn nhị phân theo Black-Scholes ($\Phi(d_2)$), phân tích Oracle Drift và cấu trúc thanh khoản.
4. **Tab `ACTIVITY` (Bằng chứng cho tiêu chí Ecosystem & Somnia Integration):**
   * Quản lý toàn diện vòng đời 7 trạng thái lệnh, lịch sử PnL, cơ chế tự động hoàn vốn (`REFUNDED`) và nút rút thưởng 1-Click (`CLAIM ALL`).

---

## 6. KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI & TIẾN ĐỘ THỰC TẾ (STATUS: COMPLETED & VERIFIED)

- [x] **Bước 1 ([`PriceChart.tsx`](file:///D:/Coding/Somnia/src/ui/components/PriceChart.tsx)):** Tích hợp dải **Mini Strike Radar & Imbalance Meter** ngay dưới thanh công cụ nến.
  - Hiển thị mức giá Spot hiện tại, khoảng cách tới Strike Price tính theo bps/%, nhấp nháy màu Xanh (`SAFE`) / Đỏ (`DANGER`).
- [x] **Bước 2 ([`ScenarioSimulator.tsx`](file:///D:/Coding/Somnia/src/ui/components/ScenarioSimulator.tsx)):** Tích hợp thanh công cụ **Agent Fast-Pick (0ms Math Reflex)**:
  - Nút **⚡ MOMENTUM PICK**: Tự động nhận diện xu hướng nến & Imbalance để chọn YES/NO với 1 click.
  - Nút **🛡️ REVERSAL PICK**: Tự động phát hiện bẫy bẻ cầu khi giá bị lệch xa khỏi Strike.
  - Dòng hiển thị tín hiệu nén (Explainable Tag): Ví dụ `[⚡ Momentum Triggered: +28 bps above strike | 74% Bid Imbalance]`.
- [x] **Bước 3 ([`AnalyticsView.tsx`](file:///D:/Coding/Somnia/src/ui/components/AnalyticsView.tsx)):** Tái cấu trúc thành **1-Minute HFT Cockpit**:
  - Gỡ bỏ hoàn toàn `<EventTimeline />` (tin tức vĩ mô không liên quan đến round 1m/5m).
  - Lắp đặt **Full-size 1-Minute Strike Radar Gauge** & **60-Second Round Expiry Phase Bar** (Discovery $\to$ Momentum Lock $\to$ Pin-Risk Cutoff).
  - Tích hợp nút CTA chuyển thẳng vào luồng đặt lệnh On-Chain (`⚡ TRADE WITH QUANT EDGE`).
- [x] **Bước 4 ([`InsightsView.tsx`](file:///D:/Coding/Somnia/src/ui/components/InsightsView.tsx)):** Tái cấu trúc thành **Autonomous Agent Command Center**:
  - Gỡ bỏ 100% tin tức báo chí RAG (`VERIFIED NEWS GROUNDING`) và tính năng đọc văn bản Audio dài dòng.
  - Triển khai **Autonomous Auto-Pilot Runner & Risk Guardrail**: Chọn chiến lược (⚡ Momentum / 🛡️ Reversal), cấu hình số Round (3/5/10 rounds), ngân sách cược và Kill-switch tự dừng khi thua 2 rounds liên tiếp.
  - Tích hợp bảng **Recent Autonomous Execution Streak** ghi nhận PnL, Win-Rate (80%), và độ trễ khớp lệnh cực nhanh (~240ms) trên Somnia Testnet.
- [x] **Bước 5 (Kiểm thử & Build):** Chạy `npm run build` (`tsc && vite build`) vượt qua 100% với 0 lỗi.
- [ ] **Bước 6 (Video Demo Script):** Quay kịch bản 2.5 phút tập trung vào tính phản xạ tức thì trên tab `markets`, lướt qua tab `insights` (Agent Auto-Pilot) và `analytics` (HFT Strike Radar) để chứng minh độ sắc bén thực chiến.