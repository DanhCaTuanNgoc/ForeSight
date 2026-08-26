# 🎯 MASTER EXECUTION PLAN & SPRINT TRACKING (HACKATHON SPRINT)

> **Project Name:** ForeSight  
> **Hackathon:** Somnia × DreamDEX Event Contracts Hackathon (DoraHacks)  
> **Core Philosophy:** *"Understand the market before you trade it"*  
> **Target Experience:** **What Happened? → What Changed? → What If? → What Do I Do?** (30-second time-to-understanding)

---

## 📊 TỔNG QUAN TIẾN ĐỘ THEO 5 PHASES (15-DAY SPRINT)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     PHASE 1     │ ──> │     PHASE 2     │ ──> │     PHASE 3     │ ──> │     PHASE 4     │ ──> │     PHASE 5     │
│   Foundation    │     │ Core Intel Exp  │     │  AI + Scenario  │     │ Execution & Web3│     │ Continuous Test │
│   & Data Layer  │     │   (Timeline)    │     │   (Simulator)   │     │  & Deployment   │     │  & Submission   │
│   (HOÀN THÀNH)  │     │   (HOÀN THÀNH)  │     │   (HOÀN THÀNH)  │     │   (ĐANG LÀM)    │     │   (TIẾP THEO)   │
│     [ 100% ]    │     │     [ 100% ]    │     │     [ 100% ]    │     │     [ 75% ]     │     │     [ 40% ]     │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📋 CHI TIẾT THEO 4 MODULE TRẢI NGHIỆM CỐT LÕI (CORE FEATURE MATRIX)

---

### 🟢 MODULE 1: PROBABILITY TIMELINE (*"What Happened?"*)
*Mục tiêu: Chuyển đổi dữ liệu xác suất thô thành câu chuyện trực quan với các mốc đột biến tương tác được.*

| ID | Task / Công Việc | Chi Tiết Kỹ Thuật (Document-v1.md) | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **1.1** | **Biểu đồ vùng Area Chart** | Render đồ thị xác suất ($0\% \rightarrow 100\%$) theo các khung thời gian 15m, 1h, 4h bằng SVG/Canvas mượt mà. | `[x]` |
| **1.2** | **Phát hiện & Đánh dấu Spike** | Tự động quét và gắn marker phát sáng tại các điểm biến động $\ge 10\%$ kèm nhãn timestamp. | `[x]` |
| **1.3** | **Interactive Hover & Tooltip** | Hiển thị chi tiết xác suất trước/sau biến động và nút bấm mở ngữ cảnh nhanh. | `[x]` |
| **1.4** | **Data Fallback & Smoothing** | Cơ chế xử lý mượt mà khi timeline rỗng hoặc thiếu điểm dữ liệu lịch sử. | `[x]` |

---

### 🧠 MODULE 2: CONTEXTUAL AI + EVIDENCE (*"What Changed?"*)
*Mục tiêu: Cung cấp ngữ cảnh sự kiện xung quanh thời điểm biến động, có trích dẫn nguồn gốc minh bạch (RAG).*

| ID | Task / Công Việc | Chi Tiết Kỹ Thuật (Document-v1.md) | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **2.1** | **Xác định Time Window $[T - 15m, T]$** | Tự động lấy khung giờ sự kiện xung quanh mốc Spike để truy xuất tin tức. | `[x]` |
| **2.2** | **News Ingestion & Vector Storage** | Worker cào tin tức crypto & vĩ mô (CoinDesk, CoinTelegraph, Binance RSS) lưu Supabase. | `[x]` |
| **2.3** | **RAG Evidence Pipeline** | Xếp hạng và truyền các sự kiện liên quan vào prompt của LLM để sinh bản tóm tắt định dạng JSON. | `[x]` |
| **2.4** | **Dual AI Arena (Bull vs Bear)** | Tạo góc nhìn 2 chiều đối kháng (Alpha Bull vs Macro Bear) tránh phán đoán một chiều. | `[x]` |
| **2.5** | **Nút [View Sources] Bắt Buộc** | Cho phép người dùng click mở trực tiếp link bài báo gốc để tự kiểm chứng. | `[x]` |
| **2.6** | **Kỷ luật AI (Coincidence vs Causation)** | Chuẩn hóa prompt: AI tuyệt đối không tự nhận định "gây ra" mà chỉ nêu "trùng thời điểm với". | `[x]` |

---

### 🎛️ MODULE 3: SCENARIO SIMULATOR (*"What If?"*)
*Mục tiêu: Biến các phép tính tài chính phức tạp thành thanh trượt mô phỏng trực quan, chính xác 100% theo toán học.*

| ID | Task / Công Việc | Chi Tiết Kỹ Thuật (Document-v1.md) | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **3.1** | **Toán học PnL Tất Định (Deterministic)** | $\text{Shares} = \frac{\text{Capital}}{\text{Entry Price}}$, $\text{Exit Value} = \text{Shares} \times \text{Exit Price}$, $\text{PnL} = \text{Exit Value} - \text{Capital}$. | `[x]` |
| **3.2** | **Thanh trượt Interactive Sliders** | Kéo chọn Vốn ($5 \rightarrow $500), Giá Vào (Entry) và Giá Ra (Target Exit) với độ trễ 0ms. | `[x]` |
| **3.3** | **Hiển thị ROI & Breakeven** | Thanh đo PnL xanh/đỏ, tỷ lệ hoàn vốn ROI %, và điểm hòa vốn tức thì. | `[x]` |
| **3.4** | **UI Safety Disclaimer** | Dòng chữ bắt buộc: *"Illustrative scenario based on selected entry and exit prices. Actual execution may vary."* | `[x]` |
| **3.5** | **Đồng bộ hóa 1-Chạm từ AI Debate** | Bấm *"Simulate Bull/Bear"* trong AI Modal sẽ tự động điền thông số vào Simulator. | `[x]` |

---

### ⚡ MODULE 4: STREAMLINED EXECUTION & WEB3 (*"What Do I Do?"*)
*Mục tiêu: Kết nối trực tiếp từ hiểu biết đến hành động đặt lệnh trên Somnia CLOB mà không rời khỏi giao diện.*

| ID | Task / Công Việc | Chi Tiết Kỹ Thuật (Document-v1.md) | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **4.1** | **1-Click Execution Buttons** | Nút `[Buy YES]` và `[Buy NO]` đặt ngay dưới Simulator kèm số lượng hợp đồng tính sẵn. | `[x]` |
| **4.2** | **Tích hợp `@somnia-chain/markets-sdk`** | Gửi lệnh `createOrder` trực tiếp lên Somnia Shannon Testnet (`Chain ID: 50312`). | `[x]` |
| **4.3** | **Quản Lý Vị Thế (Positions Table)** | Cập nhật số dư, trạng thái lệnh và vị thế thời gian thực không cần reload trang. | `[x]` |
| **4.4** | **Settlement Sweeper (Auto-Claim)** | Quét và gom toàn bộ tiền thưởng các vòng đã settle trong 1 nút bấm. | `[x]` |
| **4.5** | **Tích hợp Connect Wallet Trực Tiếp** | Popup ví MetaMask / Viem Signer cho người dùng ký giao dịch trực tiếp từ trình duyệt. | `[ ]` |

---

## 🧪 MA TRẬN CONTINUOUS TESTING (MỤC 16 TRONG DOCUMENT)

| Module | Test Case | Kết Quả Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **Timeline** | Lịch sử rỗng / API timeout | Tự động sinh baseline tổng hợp mượt mà, không crash UI | `[x]` |
| **AI Context** | Không có tin tức liên quan | Hiển thị thông báo ngữ cảnh vĩ mô, không bịa đặt nguồn | `[x]` |
| **AI Context** | Link bài báo gốc | Mọi bài viết đều có link mở tab mới kiểm chứng | `[x]` |
| **Simulator** | Kéo thanh trượt cực đại / cực tiểu | Toán học PnL chính xác tuyệt đối, không có lỗi NaN / chia cho 0 | `[x]` |
| **Trading** | Người dùng từ chối ký ví | Bắt lỗi graceful, hiển thị thông báo toast màu đỏ | `[x]` |
| **Trading** | Đặt lệnh thành công | Hiển thị toast xanh và tự động cập nhật bảng Positions | `[x]` |

---

## 🏆 KẾ HOẠCH BÀN GIAO HACKATHON (DELIVERABLES)

| Deliverable | Chi Tiết | File Tài Liệu | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **1. GitHub Repo & README** | Chuẩn hóa README với kiến trúc Mermaid & tài liệu API | [`README.md`](file:///D:/Coding/Somnia/README.md) | `[x]` |
| **2. Somnia SDK Feedback** | Báo cáo đóng góp cải tiến SDK cho đội ngũ Somnia | [`DreamDEX-SDK-Feedback.md`](file:///D:/Coding/Somnia/DreamDEX-SDK-Feedback.md) | `[x]` |
| **3. Demo Video Script** | Kịch bản quay video 2.5 phút chuẩn 4 bước | [`Demo-Video-Script.md`](file:///D:/Coding/Somnia/Demo-Video-Script.md) | `[x]` |
| **4. Cloud Deployment** | Frontend lên Vercel + Backend lên Railway | [`vercel.json`](file:///D:/Coding/Somnia/vercel.json) | `[ ]` |
| **5. Quay Video & Nộp Bài** | Nộp bài lên DoraHacks Portal trước deadline | DoraHacks Portal | `[ ]` |

---

## 🎯 CHECKLIST CÁC BƯỚC TIẾP THEO (NEXT ACTIONS)

1. **Bước 1:** Tích hợp Connect Wallet trực tiếp trên giao diện Frontend để người dùng bấm ký lệnh bằng ví MetaMask của họ.
2. **Bước 2:** Setup Supabase Cloud & Deploy Backend lên Railway.
3. **Bước 3:** Deploy Frontend lên Vercel.
4. **Bước 4:** Quay video Demo 2.5 phút theo [`Demo-Video-Script.md`](file:///D:/Coding/Somnia/Demo-Video-Script.md) và submit DoraHacks.
