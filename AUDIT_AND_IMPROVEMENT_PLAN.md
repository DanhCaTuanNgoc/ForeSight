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

## 5. BÁO CÁO PHẢN BIỆN CHUYÊN GIA & CHIẾN LƯỢC TÁI CẤU TRÚC (STRATEGIC EVOLUTION)
> **Cập nhật ngày:** 10/09/2026  
> **Nguồn:** Đánh giá độc lập theo Hackathon Rubric & Đối chiếu hệ sinh thái (DreamDEX Bot Kit, Lucid Somnia, PredicTrader AI)  
> **Mục tiêu:** Thoát khỏi bẫy "AI slop" và "Bot wrapper", xây dựng vị thế cạnh tranh độc tôn (Unfair Advantage) để đạt thang điểm **90–95+**.

### 5.1. Bóc Tách Đánh Giá Chuyên Gia (Critique Summary)

| Luận điểm chuyên gia | Đánh giá tính xác đáng | Quyết định điều chỉnh của ForeSight |
| :--- | :--- | :--- |
| **Không nên định vị "HFT" quá đà** | **Chính xác 100%**: DreamDEX là on-chain CLOB trên Somnia, Bot Kit đã có template cơ bản. Tuyên bố "HFT" dễ bị judge chất vấn về microstructure & infra. | Đổi định vị sang: **Autonomous Short-Duration Event Contract Terminal** ("AI watches the market. You decide the risk. ForeSight executes the next N rounds"). |
| **Compressed Intelligence thay vì AI Essay** | **Chính xác 100%**: User không cần 500 chữ phân tích trong round ngắn; cần tín hiệu trực quan hóa cực nhanh (0.5s comprehension). | Thay thế văn bản dài dòng bằng **Strike Radar + Order Imbalance + Compressed Signal Why?**. |
| **Bỏ nhãn "Gemini Momentum vs LLaMA Reversal"** | **Chính xác 100%**: LLM không phải thứ tạo ra edge cho momentum toán học; gắn nhãn LLM tạo cảm giác "AI wrapper bọc bot". | Chuyển thành **Chiến lược hành vi (Strategy Personalities)**: `⚡ MOMENTUM`, `🛡️ REVERSAL`, `🎯 BALANCED`. |
| **Cảnh báo bẫy "60-Second Market"** | **Rất sâu sắc**: Builder khác (Lucid Somnia) ghi nhận 60s testnet có thể gặp bottleneck thực thi, demo thực tế dùng 300s. | Không hardcode 60s; xây dựng **Adaptive Epoch Engine** tương thích cả round 60s (Blitz) lẫn 300s (Tactical). |
| **Cần có Guardrail Risk Engine** | **Cực kỳ cốt lõi**: Autonomous trading mà không có tầng quản trị rủi ro thì không phải Agent thật. | Bổ sung: Max loss limit, Max rounds, Stop after N consecutive losses, Cooldown circuit-breaker. |
| **Tận dụng Session Keys (Operator Keys)** | **Điểm cộng kỹ thuật lớn**: Không lưu private key trên server; phân tách rõ Fund Key (ví user) và Operator Key (chỉ trade/cancel, không thể rút vốn). | Tích hợp kiến trúc Session Key không lưu ký (Non-custodial Session Key Delegation). |

---

### 5.2. Phản Biện Sắc Bén & Nâng Cấp Kiến Trúc (ForeSight's Counter-Critique & Edge)

Dù chuyên gia đưa ra hướng tinh gọn rất chuẩn, nếu làm theo một cách máy móc, ForeSight sẽ đối mặt với 4 rủi ro mới:
1. **Rủi ro mất chất "AI":** Nếu gạt bỏ hoàn toàn AI và chỉ dùng công thức toán (`Momentum Score = Velocity + Imbalance`), Judge track AI sẽ hỏi: *"Tại sao gọi đây là AI Agent? Đây chỉ là script Bot Kit thông thường với vài câu lệnh if/else!"*
2. **Rủi ro đứt gãy UX khi tách 2 màn hình riêng biệt:** User xem bot chạy nhưng không thấy tương quan giá so với Strike trên Radar.
3. **Rủi ro mất Lead Signal nếu bỏ Binance Feed:** Chỉ quan sát DreamDEX feed thì không có bất kỳ lợi thế thông tin nào trước các bot khác.

**Giải pháp nâng cấp đột phá của ForeSight:**

#### A. Kiến trúc Hybrid Neuro-Symbolic (Math Reflex + Cognitive Agent)
* **Reflex Engine (Deterministic Math - Sub-second):** Tính toán độ lệch Strike, Orderbook Imbalance, Price Velocity. Math làm việc của Math, không bắt LLM làm toán.
* **Cognitive Agent Layer (Adaptive Policy & Regime Detection):**
  * **Regime Classification:** Nhận diện trạng thái thị trường (*Trend Expansion* vs *Pin-Risk Choppiness sát Strike*) để tự động điều chỉnh ngưỡng threshold cho toán học.
  * **Post-Mortem Reflection Loop:** Sau mỗi round thua, Agent thực hiện phản tư nhanh: *"Round vừa rồi thua do Imbalance đảo chiều đột ngột ở 5s cuối -> Giảm tỷ trọng Imbalance, tăng Strike Distance safety margin cho vòng tiếp theo."*
  * *Pitching Thesis:* **"The math fires the shot; the Agent calibrates the rifle between rounds."**

#### B. Oracle Latency Arbitrage (Lead-Lag Information Asymmetry)
* **Settlement Source:** Tuân thủ 100% theo Settlement Contract & Oracle chính thức của DreamDEX trên Somnia L1.
* **Leading Alpha Signal:** Stream tick-by-tick từ Binance WebSocket (~50-100ms). Nếu CEX giật breakout vượt Strike $0.15\%$ mà On-chain CLOB chưa kịp phản ánh, Agent lập tức bắt nhịp đặt lệnh trước khi cửa sổ đóng. Đây là alpha thực sự của thị trường quyền chọn ngắn hạn.

#### C. Unified Tactical Cockpit (Buồng Lái Tác Chiến Hợp Nhất)
* Không chia rẽ Market và Agent thành 2 tab rời rạc làm nguội cảm xúc người dùng.
* **Layout Duy Nhất:**
  * **Trung tâm / Bên trái:** **Strike Radar** trực quan (hiển thị vị trí thực của giá so với Strike, đếm ngược, Orderbook Imbalance).
  * **Bên phải / Overlay:** **Agent Auto-Pilot HUD** (chọn Strategy, cài Risk Engine, kích hoạt 10-Round Run).
  * **Hiệu ứng Điện Ảnh (Cinematic Moment for Demo):** Khi Agent bắn lệnh ở giây thứ 12, một Marker sinh động nảy ngay trên Strike Radar: `[⚡ AGENT ENTERED: YES @ $0.48 | CONFIDENCE 84%]`. Người xem vừa thấy lý do vào lệnh, vừa thấy vị trí giá đang rung lắc so với Strike.

---

### 5.3. Ma Trận Cạnh Tranh: Khác Biệt Hóa Tuyệt Đối

```text
┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│ Tiêu chí           │ DreamDEX Bot Kit   │ Lucid Somnia       │ ForeSight          │
├────────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Target User        │ Developers (CLI)   │ Quants / Protocols │ Retail / Degens    │
│ Giao diện          │ Code template      │ On-chain desk/lab  │ Visual Cockpit HUD │
│ Thời gian hiểu     │ Vài giờ đọc docs   │ Vài phút đọc spec  │ 0.5s Glanceable    │
│ Quản trị rủi ro    │ Tự code script     │ Contract-level     │ Visual Guardrails  │
│ Bảo mật            │ Env private key    │ Keeper-based       │ Session Keys       │
│ Trải nghiệm cốt lõi│ Chạy ngầm terminal │ Abstract desk      │ Streak/PnL Loop    │
└────────────────────┴────────────────────┴────────────────────┴────────────────────┘
```

---

### 5.4. Sơ Đồ Khối Kiến Trúc Toàn Diện (End-to-End Flow)

```mermaid
flowchart TD
    subgraph SignalLayer["1. Dual Signal Stream"]
        CEX[Binance WebSocket <br/> Fast Leading Signal 50ms]
        DEX[DreamDEX CLOB & Indexer <br/> Settlement State & Orderbook]
    end

    subgraph FeatureEngine["2. Feature & Reflex Engine (Deterministic Math)"]
        FE[Feature Extractor<br/>• Strike Distance: +0.084%<br/>• Order Imbalance: 73% Bid<br/>• Price Velocity & Acceleration]
    end

    subgraph CognitiveLayer["3. Cognitive Agent & Risk Guardrails"]
        Agent[Autonomous Agent Strategy<br/>• Regime Classifier: Trend vs Pin-Risk<br/>• Strategy: Momentum / Reversal / Balanced<br/>• Post-Mortem Loss Reflection]
        Risk[Guardrail Risk Engine<br/>• Max Capital Allocated<br/>• Max Loss Cooldown<br/>• Kill-Switch: Stop after 3 losses]
    end

    subgraph ExecutionLayer["4. Non-Custodial Execution"]
        Session[Delegated Session Key<br/>Trade-Only | No-Withdrawal]
        DEX_Exec[DreamDEX Contract Executor<br/>IOC / Market Order on Somnia L1]
    end

    subgraph UXCockpit["5. Unified Tactical Cockpit"]
        Radar[Strike Radar Live Canvas]
        Explain[Explainable Box: 3 Signal Factors]
        Streak[PnL Tracker & Win-Rate Streak]
    end

    SignalLayer --> FE
    FE --> Agent
    Agent --> Risk
    Risk --> Session
    Session --> DEX_Exec
    DEX_Exec --> UXCockpit
    UXCockpit -. Post-Round Feedback .-> Agent
```

---

## 6. KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI (VERTICAL SLICE ROADMAP)

### Giai đoạn 1: Tái cấu trúc giao diện thành Unified Tactical Cockpit (`AnalyticsView.tsx`)
- [ ] Gỡ bỏ hoàn toàn `EventTimeline`, tin tức RAG vĩ mô và bài luận lý thuyết.
- [ ] Xây dựng **Strike Radar Widget**:
  - Trục ngang Strike cố định ở giữa; bóng nến/chấm giá di chuyển thời gian thực.
  - Phân vùng trực quan: `Safe Zone` vs `Flip/Danger Zone`.
  - Đồng hồ đếm ngược Phase Bar: `Discovery (0-30s)` $\to$ `Confirmation (30-45s)` $\to$ `Expiry (45-60s)`.
- [ ] Xây dựng **Orderbook Imbalance Gauge**: Thanh đo tương quan Bid/Ask trực quan ($73\%$ Bid vs $27\%$ Ask).

### Giai đoạn 2: Tích hợp Agent Auto-Pilot Panel & Risk Engine
- [ ] Xây dựng bảng điều khiển chiến lược (Strategy Selector):
  - ⚡ **MOMENTUM:** Đánh bám trend theo xung lực giá và bid imbalance.
  - 🛡️ **REVERSAL:** Săn bẫy đảo chiều khi giá kéo xa strike và cạn kiệt động lượng.
  - 🎯 **BALANCED:** Chỉ kích hoạt khi độ tin cậy $> 80\%$.
- [ ] Triển khai **Guardrail Risk Engine Form**:
  - `Allocated Capital` (ví dụ 10 tUSDC).
  - `Rounds to Trade` (ví dụ 5, 10 rounds).
  - `Risk Per Round` (ví dụ 1 tUSDC).
  - `Stop Condition` (dừng khi thua liên tiếp 3 rounds hoặc chạm Max Loss).
- [ ] Thiết kế **Explainable Decision Box**: Hiển thị 3 chỉ số ngắn gọn vì sao vào lệnh (thay vì bài văn AI):
  - `✓ Strike Distance: +11 bps`
  - `✓ CLOB Imbalance: 78% Bid`
  - `✓ Momentum Velocity: +0.031%`

### Giai đoạn 3: Cơ chế Session Keys & Direct Execution
- [ ] Triển khai Session Key Provider: Tạo ephemeral keypair trong trình duyệt, user ký cấp quyền `Trade-Only` (không có quyền `Withdraw`).
- [ ] Kết nối Executor gửi lệnh trực tiếp vào DreamDEX Settlement / CLOB contract với cờ IOC (Immediate-Or-Cancel).
- [ ] Cập nhật bảng PnL & Streak Counter trực tiếp trên màn hình: Hiển thị chuỗi thắng/thua `✓ +0.18 | ✓ +0.21 | ✕ -0.10` kèm link Somnia Explorer TxHash.

### Giai đoạn 4: Quay Video Demo 2.5 Phút Chuẩn Sân Khấu Hackathon
- [ ] **00:00 - 00:20 (Hook):** *"A one-minute prediction contract shouldn't require you to watch the screen for 60 seconds."*
- [ ] **00:20 - 00:50 (The Cockpit):** Giới thiệu Strike Radar & Imbalance (nắm bắt cục diện trong 0.5s).
- [ ] **00:50 - 01:30 (Agent In Action):** Chọn Momentum, set 10 rounds/10 tUSDC, kích hoạt bot bằng Session Key $\to$ Lệnh bắn lên radar và on-chain trong 300ms.
- [ ] **01:30 - 02:10 (Risk & Settlement):** Demo 1 round thắng, 1 round thua và Risk Engine lập tức kiểm soát vốn; link TxHash trên Somnia Explorer.
- [ ] **02:10 - 02:30 (Closing):** *"Don't watch the market. Let ForeSight watch it for you."*