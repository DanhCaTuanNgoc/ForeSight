# 🎙️ ForeSight Terminal — Master Demo Script & Pitch Guide
> **Somnia × DreamDEX Event Contracts Hackathon 2026**  
> **Dự án:** ForeSight Terminal — Institutional AI Intelligence & Prediction Market Cockpit  
> **Mạng lưới:** Somnia Shannon Testnet (Chain ID: `50312`)  
> **Thời lượng demo chuẩn:** 2 – 3 phút  

---

## 📋 I. Chuẩn Bị Trước Khi Bắt Đầu (Pre-Demo Setup)

1. **Ví MetaMask:**
   - Đã chuyển sang mạng: **Somnia Testnet (Shannon)** — Chain ID `50312`.
   - Số dư Gas: **~50 STT** (đã faucet từ Telegram/Web).
   - Đã ngắt kết nối (`Disconnect`) trước khi bắt đầu để show thao tác kết nối ví thực tế cho Giám khảo.
2. **Nguồn vốn cược:**
   - **1,000.00 tUSDC** (In-App Testnet Collateral Credit tích hợp sẵn trong ForeSight).
3. **Môi trường chạy:**
   - Web frontend: `http://localhost:5173` (hoặc domain production deployed).
   - Backend API: `http://localhost:3001` (trạng thái `HEALTH: OK`).

---

## 🎬 II. Kịch Bản Demo Chi Tiết Từng Bước (Step-by-Step Walkthrough)

```text
[0:00 - 0:25] Mở đầu & Giới thiệu Tầm nhìn
[0:25 - 0:50] Connect Wallet & Ticker Tape L1
[0:50 - 1:25] Phân tích Biểu đồ & Dual AI Debate
[1:25 - 2:05] Mô phỏng Toán học & Đặt lệnh CLOB
[2:05 - 2:40] Theo dõi Vị thế, Early Exit & Settlement Sweeper
[2:40 - 3:00] Alpha Card & Tổng kết Kêu gọi
```

---

### ⏱️ PHẦN 1: MỞ ĐẦU & NÊU BẬT VẤN ĐỀ (0:00 - 0:25)
* **Màn hình hiển thị:** [Landing Page](file:///D:/Coding/Somnia/src/ui/components/LandingPage.tsx) (`Overview`).
* **Hành động:** Di chuột qua Hero Section và mô hình Cockpit 3D tương tác.
* **Lời thoại (Voiceover):**
  > *"Xin chào Ban Giám Khảo, hiện nay các nền tảng Prediction Market truyền thống thường thiếu công cụ phân tích chiều sâu, khiến người dùng giao dịch theo cảm tính và bị kẹt vốn khi thị trường đảo chiều.*  
  > *Hôm nay, chúng tôi mang đến **ForeSight Terminal** — Trạm điều khiển giao dịch thông minh thế hệ mới, kết hợp sức mạnh khớp lệnh tốc độ cao của **DreamDEX CLOB** trên **Somnia L1**, cùng hệ thống **AI Dual Debate đối kháng** và bộ tính toán mô phỏng toán học tức thì dưới 1 mili-giây."*

---

### ⏱️ PHẦN 2: KẾT NỐI VÍ ON-CHAIN & TICKER TAPE (0:25 - 0:50)
* **Màn hình hiển thị:** Click nút `Launch Terminal` hoặc `Connect Wallet` ở Header.
* **Hành động:** 
  1. Click **Connect Wallet** -> Modal bật lên với logo MetaMask chính thức.
  2. Chọn **MetaMask** -> Cửa sổ Extension MetaMask bật lên trên màn hình.
  3. Bấm **Next -> Connect** -> Header hiển thị địa chỉ ví rút gọn kèm số dư **50 STT** và **1,000 tUSDC**.
* **Lời thoại (Voiceover):**
  > *"Đầu tiên, chúng tôi kết nối ví MetaMask trực tiếp với mạng **Somnia Shannon Testnet**. Như quý giám khảo thấy, ví đã có sẵn 50 STT để trả phí gas on-chain.*  
  > *Đồng thời, để đảm bảo tiêu chuẩn **Zero-Friction Onboarding**, hệ thống ForeSight tự động cấp sẵn **1,000 tUSDC Testnet Collateral Credit**, giúp người dùng có thể trải nghiệm đặt cược ngay lập tức mà không cần tốn thời gian xin token thử nghiệm ở bên ngoài.*  
  > *Phía trên cùng là thanh **Market Ticker Tape**, cập nhật liên tục các biến động giá và anomaly spike từ các hợp đồng Event Contracts của Somnia."*

---

### ⏱️ PHẦN 3: PHÂN TÍCH THỊ TRƯỜNG & DUAL AI DEBATE ARENA (0:50 - 1:25)
* **Màn hình hiển thị:** Màn hình [Terminal (Markets)](file:///D:/Coding/Somnia/src/ui/App.tsx) hoặc click nút `AI DEBATE` trên thanh Stats.
* **Hành động:**
  1. Chọn cặp thị trường `BTC / tUSDC` từ Sidebar.
  2. Quan sát biểu đồ xác suất Area Chart (EMA 9/21, Spike Detection).
  3. Bấm nút `AI DEBATE` (hoặc mở tab **AI Insights**) để hiển thị màn hình tranh biện.
  4. Chỉ vào 2 phe **Alpha Bull** (luận điểm tăng) vs **Macro Bear** (luận điểm giảm) kèm **nguồn trích dẫn tin tức RSS thật (CoinDesk, Cointelegraph)**.
  5. Click nút `Load Bull Scenario into Simulator`.
* **Lời thoại (Voiceover):**
  > *"Khi quan sát cặp BTC, hệ thống phát hiện một biến động xác suất bất thường. Thay vì chỉ dùng 1 mô hình AI đưa ra nhận định thiên vị, ForeSight kích hoạt **Dual AI Debate Arena**:*  
  > *- Phe **Alpha Bull** bảo vệ kịch bản Tăng dựa trên dòng tiền spot hấp thụ thanh khoản.*  
  > *- Phe **Macro Bear** cảnh báo áp lực cản kỹ thuật.*  
  > *Tất cả luận điểm đều có **trích dẫn nguồn báo chí thực tế**. Chúng tôi chọn áp dụng chiến lược của phe Bull và nạp trực tiếp vào Simulator chỉ với 1 cú click."*

---

### ⏱️ PHẦN 4: DETERMINISTIC SCENARIO SIMULATOR & ĐẶT LỆNH CLOB (1:25 - 2:05)
* **Màn hình hiển thị:** Khung [Scenario Simulator](file:///D:/Coding/Somnia/src/ui/components/ScenarioSimulator.tsx) ở nửa dưới trung tâm.
* **Hành động:**
  1. Điều chỉnh thanh trượt Capital: `$50 tUSDC`.
  2. Xem các chỉ số toán học nhảy số tức thì: **Velocity Coverage (1.28x Req - Đạt chuẩn)**, Breakeven Level, Dự phóng PnL: **+$40.91 tUSDC (+81.8% ROI)**.
  3. Click `EXECUTE CLOB ORDER`.
  4. Nghe âm thanh chime, popup Toast hiện thông báo khớp lệnh kèm mã Transaction Hash on-chain.
* **Lời thoại (Voiceover):**
  > *"Tại Scenario Simulator, bộ xử lý định lượng phía client tính toán độ khả thi của lệnh dưới 1 mili-giây theo mô hình Black-Scholes.*  
  > *Chỉ số **Velocity Coverage đạt 1.28x**, cho thấy tốc độ giá hiện tại đủ sức chạm mục tiêu trước khi hợp đồng đáo hạn.*  
  > *Chúng tôi đặt cược 50 tUSDC với tỷ lệ Entry Odds $0.55 và bấm **EXECUTE CLOB ORDER**. Lệnh được dispatch thẳng vào Orderbook DreamDEX trên Somnia Shannon L1, sinh Transaction Hash minh bạch ngay lập tức!"*

---

### ⏱️ PHẦN 5: THEO DÕI VỊ THẾ, EARLY EXIT & SETTLEMENT SWEEPER (2:05 - 2:40)
* **Màn hình hiển thị:** [Thesis Health Monitor](file:///D:/Coding/Somnia/src/ui/components/ThesisHealthMonitor.tsx) (Bottom Dock) & [Activity View](file:///D:/Coding/Somnia/src/ui/components/ActivityView.tsx) (Portfolio).
* **Hành động:**
  1. Chỉ vào **Bottom Dock**: Hiển thị trạng thái *Thesis: 82% Valid*, *Pace: +0.038%/m*, *Time to Expiry: 23m*.
  2. Chuyển sang tab **Portfolio (`Activity`)**: Xem bảng danh sách lệnh đang mở (In Flight).
  3. Demo tính năng **Early Exit**: Click nút `EXIT` tại một lệnh đang chạy -> Khóa lợi nhuận sớm, chuyển trạng thái sang `Closed` kèm Realized PnL.
  4. Demo tính năng **Claim Payouts**: Click nút `CLAIM PAYOUTS` -> Kích hoạt `SettlementSweeper` gom tiền thắng của các lệnh Settled về ví trong 1 giao dịch MultiCall duy nhất.
* **Lời thoại (Voiceover):**
  > *"Ngay phía dưới là **Thesis Health Monitor** liên tục kiểm tra sức khỏe của luận điểm đầu tư theo thời gian thực.*  
  > *Trong tab Portfolio, người dùng có 2 quyền năng tối thượng:*  
  > *1. **Early Exit trên CLOB:** Nếu thị trường biến động có lời trước giờ đáo hạn, chúng ta bấm **EXIT** để bán lại hợp đồng vào sổ lệnh và chốt lời ngay.*  
  > *2. **Settlement Sweeper:** Khi các hợp đồng tất toán thắng cuộc, thay vì phải rút từng lệnh tốn gas, chỉ cần bấm **CLAIM PAYOUTS** để hệ thống gom toàn bộ tiền thưởng về ví trong 1 batch duy nhất."*

---

### ⏱️ PHẦN 6: VERIFIABLE ALPHA CARD & TỔNG KẾT (2:40 - 3:00)
* **Màn hình hiển thị:** Click nút `CARD` trong bảng Portfolio để mở [AlphaCardModal](file:///D:/Coding/Somnia/src/ui/components/AlphaCardModal.tsx).
* **Hành động:** 
  1. Hiển thị thẻ đồ họa Alpha Card với đầy đủ thông tin: Cặp giao dịch, ROI%, Entry Price, mã Hash giao dịch trên Somnia Explorer và mã QR xác thực.
  2. Bấm Copy link hoặc tải ảnh thẻ.
* **Lời thoại (Voiceover):**
  > *"Cuối cùng, người dùng có thể xuất **Verifiable Alpha Card** chứa mã bằng chứng on-chain để chia sẻ lên mạng xã hội, thúc đẩy tương tác cộng đồng cho hệ sinh thái Somnia và DreamDEX.*  
  > *ForeSight Terminal không chỉ là một công cụ giao dịch, mà là cánh cổng đưa người dùng Web2 và Web3 tiếp cận thị trường Event Contracts một cách thông minh, an toàn và trực quan nhất. Cảm ơn Ban Giám Khảo!"*

---

## ❓ III. Bộ Câu Hỏi & Trả Lời Dự Phòng Cho Giám Khảo (Q&A Defense)

#### Q1: "Dự án tương tác với DreamDEX và Somnia L1 như thế nào?"
> **Trả lời:** *"ForeSight tích hợp với DreamDEX qua 3 tầng: (1) Ingestion Layer đọc Orderbook Level 2 và Event Contracts; (2) Execution Engine định tuyến lệnh giới hạn (Limit Orders) vào DreamDEX CLOB; và (3) Settlement Sweeper tận dụng tốc độ sub-second của Somnia Shannon để gom thưởng tất toán hàng loạt qua MultiCall."*

#### Q2: "Tại sao lại cần Dual AI Debate thay vì 1 AI Bot thông thường?"
> **Trả lời:** *"Các AI Bot đơn lẻ thường bị hội chứng hallucination và thiên kiến theo câu lệnh prompt. Mô hình đối kháng Bull vs Bear của ForeSight buộc 2 agent phải tìm kiếm bằng chứng tin tức thực tế (RAG-cited) để phản biện nhau, giúp nhà đầu tư nhìn thấy rủi ro ở cả 2 chiều trước khi bỏ vốn."*

#### Q3: "STT và tUSDC được sử dụng ra sao trong hệ thống?"
> **Trả lời:** *"STT là native token của Somnia dùng để trả phí gas cho các giao dịch on-chain. tUSDC / USDso là đơn vị tiền tệ ký quỹ dùng để mua cổ phần hợp đồng nhị phân ($0.01 - $0.99) và nhận thanh toán $1.00 khi thắng theo đúng cơ chế của DreamDEX."*

---
*Chúc bạn có một buổi thuyết trình và demo bùng nổ, đạt giải thưởng cao nhất tại Hackathon! 🚀*
