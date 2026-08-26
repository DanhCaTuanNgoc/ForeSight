# 🧠 ForeSight — Project Details & Technical Architecture Document
### *Decision-Support Intelligence Terminal for DreamDEX Event Contracts on Somnia L1*

> **Project Name:** ForeSight  
> **Core Philosophy:** *"Understand the market before you trade it"* (Hỗ trợ người dùng hiểu rõ bối cảnh thị trường trước khi tự ra quyết định)  
> **Target Protocol:** DreamDEX Event Contracts via `@somnia-chain/markets-sdk`  
> **Blockchain Network:** Somnia Shannon Testnet (`Chain ID: 50312`)  
> **Live Demo:** [https://fore-sight-tawny.vercel.app/](https://fore-sight-tawny.vercel.app/)  
> **GitHub:** [https://github.com/DanhCaTuanNgoc/ForeSight](https://github.com/DanhCaTuanNgoc/ForeSight)  

---

## 📌 1. Tuyên Bố Phạm Vi & Tính Khách Quan (Disclaimer & Scope)

> [!IMPORTANT]
> **Tuyên Bố Quan Trọng Về Mặt Sản Phẩm:**
> * **Không Phải Lời Khuyên Đầu Tư:** ForeSight là một công cụ phân tích và hỗ trợ ra quyết định (Decision-Support Tool), **tuyệt đối không dự đoán tương lai thay cho người dùng** và **không cam kết bất kỳ mức lợi nhuận nào**.
> * **Kỷ Luật AI (Coincidence vs Causation):** Trợ lý AI trong ForeSight được thiết lập để chỉ nêu các sự kiện tin tức *diễn ra trùng thời điểm* với biến động giá, không tự ý khẳng định mối quan hệ nhân quả tuyệt đối.
> * **Mô Phỏng Giả Định (Scenario Math):** Các chỉ số PnL/ROI trong Simulator là kết quả tính toán toán học thuần túy dựa trên các mốc giá do người dùng tự chọn, không phản ánh kết quả giao dịch thực tế nếu thị trường không đạt được mốc giá đó.

---

## 🌟 2. Tổng Quan Dự Án & Bối Cảnh Thực Tế

### 2.1 Bối Cảnh Thị Trường Binary Prediction Market Trên Somnia
Trên blockchain Somnia L1 (với thiết kế hướng tới thông lượng cao và thời gian xác thực khối nhanh), sàn giao dịch DreamDEX vận hành hơn **500 thị trường sự kiện nhị phân (Event Contracts)** theo các khung thời gian từ ngắn (1 phút, 5 phút, 15 phút) đến dài (1 giờ, 1 ngày).

Ở các vòng giao dịch tốc độ cao, người tham gia thường gặp phải 3 khó khăn thực tế:
1. **Thiếu ngữ cảnh khi xác suất biến động nhanh (Spike $\ge 10\%$):** Khi tỷ lệ cược nhảy từ 30% lên 70% trong vài phút, người dùng thông thường khó nắm bắt kịp tin tức vĩ mô hoặc biến động giá spot của tài sản cơ sở.
2. **Áp lực thời gian tra cứu:** Các vòng ngắn đóng lệnh rất nhanh, việc tự tìm kiếm và đối chiếu mốc thời gian tin tức thủ công là bất khả thi.
3. **Độ phức tạp khi tính toán lợi nhuận/rủi ro:** Hợp đồng nhị phân có cơ chế giá cổ phần (shares từ $0.01 đến $0.99) và thanh toán tất toán $1.00 khi thắng hoặc $0.00 khi thua. Việc tính nhẩm điểm hòa vốn hay lợi nhuận khi chốt lời sớm trước khi đáo hạn đòi hỏi công thức toán học cụ thể.

### 2.2 Mục Tiêu Của ForeSight
ForeSight không thay thế vai trò của sàn DreamDEX mà đóng vai trò là **lớp giao diện phân tích (Intelligence Layer)**, giúp người dùng gom các bước phân tích rời rạc thành một chu trình 4 bước có cấu trúc rõ ràng.

---

## 🔄 3. Chu Trình Ra Quyết Định 4 Bước (4-Step Workflow)

```text
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   1. WHAT HAPPENED?     │ ──> │    2. WHAT CHANGED?     │ ──> │     3. WHAT IF?         │ ──> │   4. WHAT DO I DO?      │
│   Probability Timeline  │     │   Dual AI Arena (RAG)   │     │   Scenario Simulator    │     │   1-Click CLOB Trade    │
│  (Area Chart + Spikes)  │     │  (Bull vs Bear Debate)  │     │  (Deterministic Math)   │     │  & Auto-Claim Sweeper   │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

### Bước 1: What Happened? (Probability Timeline & Spike Detection)
* **Chức năng:** Trực quan hóa biến động xác suất ($0\% \rightarrow 100\%$) theo thời gian thực bằng biểu đồ vùng (Area Chart) qua các khung 15m, 1h, 4h.
* **Cơ chế thực tế:** Worker quét định kỳ (mỗi 10s) ghi nhận lịch sử biến động từ DreamDEX indexer. Khi mức thay đổi giữa 2 snapshot vượt ngưỡng $\ge 10\%$, hệ thống tự động gắn thẻ **Spike Marker** kèm nhãn thời gian để người dùng dễ quan sát.

### Bước 2: What Changed? (Dual AI Debate Arena + RAG News Evidence)
* **Chức năng:** Khi người dùng bấm vào một mốc biến động, hệ thống truy xuất các bài báo crypto/vĩ mô trong khung thời gian $[T - 15\text{m}, T]$.
* **Nguyên lý đối kháng 2 chiều:**
  * **Alpha Bull AI:** Phân tích các yếu tố hỗ trợ chiều tăng (độ lệch sổ lệnh orderbook, khối lượng mua, tin tức tích cực).
  * **Macro Bear AI:** Phân tích các yếu tố rủi ro (cản cung phía trên, rủi ro suy giảm giá trị theo thời gian time-decay, tin tức tiêu cực).
* **Minh bạch nguồn tin (`[View Sources]`):** Mọi luận điểm tóm tắt đều kèm link bài báo gốc (từ CoinDesk, CoinTelegraph, Binance RSS) để người dùng tự bấm vào kiểm chứng, loại bỏ hiện tượng AI bịa đặt thông tin (hallucination).

### Bước 3: What If? (Decision Stress Test & Trajectory Modeling)
* **Khái niệm cốt lõi:** Chuyển đổi hợp đồng cược nhị phân từ một trò may rủi thành một **quỹ đạo quyết định có thể đo lường và kiểm chứng toán học (Measurable Decision Trajectory)**. Gồm 3 tầng kiến trúc:
  1. **Layer 1 — Path to Settlement (Đo lường Vận tốc Quỹ đạo):**
     * Tính toán khoảng cách giá cần di chuyển: $\Delta\%_{\text{required}} = \frac{|P_{\text{strike}} - P_{\text{current}}|}{P_{\text{current}}} \times 100\%$
     * Tính toán vận tốc giá yêu cầu: $v_{\text{req}} = \frac{\Delta\%_{\text{required}}}{T_{\text{remaining}}}$ (%/phút)
     * Đo lường đà tăng/giảm quan sát thực tế: $v_{\text{obs}}$ (%/phút)
     * Chỉ số **Velocity Coverage ($VC = \frac{v_{\text{obs}}}{v_{\text{req}}}$)** hiển thị minh bạch dạng `1.28× Required Velocity` (khẳng định đà tăng hiện tại có đủ độ dốc để chạm mốc strike trước khi đáo hạn hay không, tuyệt đối không dùng xác suất % ảo).
  2. **Layer 2 — Thesis Check & Break Conditions (Quản trị Rủi ro Pre-Trade):**
     * Minh bạch hóa 3 điều kiện phủ định luận điểm trước khi đặt cược (ví dụ: *Giá spot thủng mốc hỗ trợ $X, Vận tốc đảo chiều âm, hoặc còn <10m mà giá không tiến triển*).
  3. **Layer 3 — Deterministic Financial Simulator (Toán học PnL 0ms):**
     * $\text{Số Hợp Đồng} = \frac{\text{Vốn}}{\text{Giá Vào}}$
     * $\text{PnL Chốt Sớm} = (\text{Số Hợp Đồng} \times \text{Giá Mục Tiêu}) - \text{Vốn}$
     * $\text{PnL Đáo Hạn} = (\text{Số Hợp Đồng} \times \$1.00) - \text{Vốn}$
     * $\text{Max Loss} = -100\% \text{ Vốn Đầu Tư}$ (Cảnh báo rủi ro tuyệt đối).
     * Phép tính chạy trực tiếp ở client-side với độ trễ **0ms**, không phụ thuộc API LLM.

### Bước 4: What Do I Do? (Streamlined Execution & Settlement Sweeper)
* **Chức năng:** Chuyển các thông số đã tính toán thành lệnh limit order gửi lên DreamDEX CLOB qua `@somnia-chain/markets-sdk`.
* **Cơ chế dự phòng (Simulation Mode):** Nếu người dùng chưa cấu hình Private Key hoặc ví Web3, hệ thống sẽ lưu vị thế dưới dạng mô phỏng nội bộ (In-memory Simulation) để kiểm thử giao diện mà không gây lỗi ứng dụng.
* **Auto-Claim Settlement Sweeper:** Quét danh sách các hợp đồng đã đáo hạn và gửi giao dịch rút thưởng hàng loạt, giải quyết tình trạng người dùng bỏ quên tiền thắng cược ở nhiều vòng nhỏ.

---

## 🏗️ 4. Tổng Quan Kiến Trúc Kỹ Thuật (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT / USER INTERFACE LAYER (React 19, Vite 6, Tailwind CSS)      │
│    - Landing Page & 3D Parallax Sandbox                                │
│    - Trading Terminal: Market Navigator, Recharts Area Chart,          │
│      Scenario Simulator Sliders, Positions Table                       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. INTELLIGENCE & DATA LAYER (Node.js / Express, Supabase PostgreSQL) │
│    - MarketSnapshotWorker (10s Poller & Spike Tagger)                  │
│    - NewsIngestionWorker (RSS Parser for Crypto/Macro Headlines)       │
│    - DualDebateEngine (Prompt Constraints & Source Ranking)            │
│    - Deterministic Math Calculation Module                             │
├────────────────────────────────────────────────────────────────────────┤
│ 3. BLOCKCHAIN & PROTOCOL LAYER                                         │
│    - Somnia Shannon Testnet (Chain ID: 50312)                          │
│    - DreamDEX GraphQL Indexer (dev.smk.somnia.host)                    │
│    - DreamDEX CLOB Contracts (@somnia-chain/markets-sdk + Viem)        │
│    - Prophecy Decentralized Spot Price Feed Oracles                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💎 5. Đánh Giá Ưu Điểm Thực Tế (Strengths & Value-Add)

1. **Giảm Thiểu Tình Trạng Quá Tải Thông Tin:** Tích hợp trực tiếp tin tức có dẫn chứng vào mốc thời gian biến động giá, giúp người dùng tiết kiệm thời gian tra cứu độc lập.
2. **Loại Bỏ Góc Nhìn Thiên Vị (Anti-Bias):** Bằng cách trình bày song song cả góc nhìn Bull (ủng hộ) và Bear (cảnh báo rủi ro), hệ thống giúp người dùng tránh tâm lý FOMO một chiều.
3. **Mô Phỏng Tài Chính Minh Bạch:** Giúp người mới tham gia hiểu rõ cấu trúc PnL và điểm hòa vốn trước khi thực hiện giao dịch thật.
4. **Cộng Hưởng Hệ Sinh Thái:** Không cạnh tranh thanh khoản với DreamDEX mà hoạt động như một tầng giao diện tiện ích thúc đẩy khối lượng giao dịch cho giao thức DreamDEX.
5. **Tiện Ích Settlement Sweeper:** Tiết kiệm thao tác và chi phí thời gian cho người dùng khi tham gia nhiều vòng ngắn hạn.

---

## ⚠️ 6. Hạn Chế & Rủi Ro Thực Tế Cần Lưu Ý (Limitations & Risks)

Để đánh giá sản phẩm một cách khách quan nhất, dưới đây là các giới hạn kỹ thuật và rủi ro thị trường hiện tại:

| Hạn Chế / Rủi Ro | Phân Tích Thực Tế | Hướng Khắc Phục Trong Tương Lai |
| :--- | :--- | :--- |
| **Độ Trễ Nguồn Tin RSS** | Các nguồn RSS công khai (CoinDesk, CoinTelegraph) có độ trễ từ 2–5 phút so với tin tức nhanh trên Twitter/Telegram. Trong các vòng 1–5 phút, AI có thể không kịp cập nhật sự kiện flash-news ngay tại giây đầu tiên. | Mở rộng tích hợp Twitter API và các luồng WebSocket tin tức tài chính chuyên sâu. |
| **Rủi Ro Trượt Giá (Slippage) Khi Thanh Khoản Mỏng** | Trên môi trường Testnet, thanh khoản ở một số hợp đồng có thể mỏng. Lệnh thực tế có thể không khớp được toàn bộ ở mức giá mong muốn như trong Simulator. | Bổ sung cảnh báo độ sâu sổ lệnh (Depth Warning) trước khi người dùng bấm đặt lệnh. |
| **Rủi Ro Mất Vốn Của Binary Contracts** | Nếu giữ hợp đồng đến khi đáo hạn và kết quả ngược với dự đoán, giá trị hợp đồng sẽ về **$0.00** (mất toàn bộ số vốn đặt cho hợp đồng đó). | Simulator luôn hiển thị rõ thông số `Max Loss = 100% Vốn Đầu Tư` để nhắc nhở người dùng. |
| **Phụ Thuộc Vào Tính Ổn Định Của RPC & Indexer** | Nếu RPC Somnia hoặc GraphQL Indexer gặp sự cố nghẽn mạng, dữ liệu snapshot có thể bị ngắt quãng. | Bổ sung cơ chế tự động chuyển đổi RPC (RPC Fallback) và bộ nhớ đệm cache client-side. |
| **Trạng Thái Ký Ví Trình Duyệt** | Phiên bản hiện tại hỗ trợ đặt lệnh qua cấu hình Private Key (Backend Signer) và chế độ High-Fidelity Simulation; việc kết nối popup ví MetaMask trực tiếp trên browser đang ở giai đoạn hoàn thiện. | Nâng cấp tích hợp RainbowKit / Web3Modal trực tiếp trên frontend. |

---

## 🎯 7. Định Vị Chiến Lược: Tại Sao Là "Terminal" Thay Vì Sàn Giao Dịch Độc Lập?

1. **Tránh Trùng Lặp Chức Năng:** DreamDEX đã là hạ tầng sàn giao dịch CLOB và quản lý thanh khoản cốt lõi trên Somnia. Xây dựng thêm một giao diện cược thông thường sẽ không mang lại giá trị gia tăng mới.
2. **Tập Trung Vào Quyết Định Của Con Người:** ForeSight đóng vai trò là trạm điều khiển thông minh (như mô hình Bloomberg Terminal trong tài chính truyền thống), trang bị đầy đủ dữ liệu, ngữ cảnh và công cụ tính toán để nhà giao dịch tự tin đưa ra quyết định của riêng mình.
3. **Mô Hình Hợp Tác:** ForeSight mang lại lượng người dùng phân tích và lệnh giao dịch cho DreamDEX, đồng thời DreamDEX cung cấp thanh khoản và độ sâu thị trường cho ForeSight.

---

## 🗺️ 8. Trạng Thái Triển Khai & Lộ Trình (Roadmap)

### Đã Hoàn Thành (Current Milestones):
- [x] Tích hợp `@somnia-chain/markets-sdk` và viem truy vấn hơn 500 thị trường trên Somnia Shannon Testnet.
- [x] Worker snapshot 10s tự động phát hiện và đánh dấu mốc Spike $\ge 10\%$.
- [x] Pipeline RAG thu thập tin tức RSS và tạo luận điểm tranh luận 2 chiều Bull vs Bear kèm trích dẫn.
- [x] Module Scenario Simulator tính toán PnL tất định với độ trễ 0ms.
- [x] Auto-Claim Settlement Sweeper quét và gom tiền thưởng các vòng kết thúc.
- [x] Giao diện Cyberpunk hoàn chỉnh (Landing Page + Terminal) triển khai trực tiếp trên Vercel.

### Kế Hoạch Tiếp Theo (Upcoming Backlog):
- [ ] Tích hợp Web3 Wallet Modal trực tiếp trên trình duyệt (MetaMask / OKX / Rabby).
- [ ] Bổ sung luồng WebSocket cập nhật trực tiếp biến động sổ lệnh thời gian thực.
- [ ] Mở rộng RAG sang dữ liệu On-Chain Analytics (Whale movements, Liquidity Inflow/Outflow).

---

*Tài liệu được chuẩn hóa phục vụ Somnia × DreamDEX Event Contracts Hackathon.*
