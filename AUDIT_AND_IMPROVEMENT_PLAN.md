# 📋 BÁO CÁO PHÂN TÍCH ĐÁNH GIÁ & KẾ HOẠCH CẢI THIỆN FORESIGHT
> **Dự án:** ForeSight — Binary Prediction Markets on Somnia  
> **Nguồn đánh giá:** danhgia.txt & User Alignment  
> **Cập nhật ngày:** 09/09/2026  
> **Mục tiêu:** Khắc phục triệt để các sai lệch về bản chất sản phẩm (Prediction Market vs Futures), loại bỏ 100% dữ liệu mock/fake, chuẩn hóa toàn bộ luồng dữ liệu từ DreamDEX (Strike, Pairs, Orderbook), tập trung toàn bộ thuật toán định lượng vào AnalyticsView và đưa hệ thống về đúng luật giải đấu.

---

## 1. TỔNG HỢP CÁC QUYẾT ĐỊNH THIẾT KẾ CỐT LÕI (ALIGNED ARCHITECTURE)

1. **Cơ chế vào/đóng lệnh (No Early Exit / No TP-SL):**
   - Không áp dụng TP/SL và không áp dụng Early Cash-out cho các vòng cược siêu ngắn (1m, 5m, 15m).
   - Mô hình tinh gọn chuẩn xác: **BUY YES hoặc BUY NO -> Khóa cược -> Đếm ngược hết round -> Oracle chốt kết quả -> Claim thưởng**.
   - Xóa bỏ hoàn toàn các hàm Math.random() fake khớp lệnh trên frontend/backend.
2. **Đồ thị giá (Spot Price Candlesticks thay vì % ảo):**
   - Đồ thị chính chuyển sang hiển thị **Nến giá thực tế (Spot Price)** của BTC/ETH/SOL.
   - Vẽ đường kẻ ngang **Strike Price (mức giá mục tiêu)** lấy trực tiếp từ DreamDEX contract để người dùng thấy rõ nến đang dao động trên hay dưới vạch mục tiêu.
   - Các nút Timeframe (1m, 5m, 15m, 1h) kết nối dữ liệu thực.
3. **Gom toàn bộ thuật toán định lượng vào AnalyticsView.tsx:**
   - Đưa toàn bộ các chỉ số toán học tài chính vào một trung tâm phân tích duy nhất:
     - **CLOB Orderbook Imbalance (OI):** Tỷ lệ áp lực mua/bán ở các bước giá tốt nhất.
     - **Spread Compression & Velocity:** Tốc độ co giãn biên độ Bid/Ask.
     - **Black-Scholes Binary Fair Value (Phi(d2)):** Xác suất toán học định giá hợp đồng nhị phân.
     - **Oracle Drift & Target Distance:** Khoảng cách giữa giá Spot hiện tại và điểm Strike.
4. **Chuẩn hóa 100% Data Flow từ DreamDEX:**
   - Mở rộng bộ lọc trong MarketWatcher để lấy toàn bộ 58+ market thật trên DreamDEX Testnet (bao gồm các venue 0x1a1e68..., 0x679795..., 0xa3c034...).
   - Parse chính xác strikePrice từ info.strike của DreamDEX (format chuẩn số thập phân USD).
   - Xóa bỏ toàn bộ market mock (sol-hourly-clob-1, FALLBACK_MARKETS).
   - Không fake orderbook ngẫu nhiên (Math.abs(seed...)) trong DepthChart.tsx.
   - Động hóa số lượng thị trường hiển thị ({markets.length} ACTIVE).

---

## 2. MA TRẬN PHÂN CÔNG & FILE THAY ĐỔI

| Thành phần | File cần sửa | Nhiệm vụ chi tiết |
| :--- | :--- | :--- |
| **Market Data Watcher** | src/core/market-watcher.ts | • Hỗ trợ nhận diện toàn bộ các venue hợp lệ của DreamDEX.<br>• Parse đúng strikePrice từ rawInfo.strike (chia cho decimals tương ứng).<br>• Trích xuất đúng interval, expirationTime, marketAddress, yesTokenId, noTokenId. |
| **Backend API Server** | src/server/index.ts | • Xóa bỏ mock push (sol-hourly-clob-1, somi-hourly-clob-1).<br>• Trả về 100% dữ liệu market thật kèm strikePrice chuẩn xác.<br>• Làm sạch các endpoint không cần thiết. |
| **Trading Form** | src/ui/components/ScenarioSimulator.tsx | • Xóa bỏ toàn bộ toggle và input TP/SL.<br>• Giữ giao diện cược YES/NO tinh gọn: Nhập số tiền cược -> hiển thị Payout ước tính -> Nút Confirm Order. |
| **Price Chart** | src/ui/components/PriceChart.tsx | • Hiển thị nến giá Spot coin thật kèm đường ngang Strike Price.<br>• Kích hoạt các nút timeframe 1m, 5m, 15m, 1h. |
| **Orderbook Depth** | src/ui/components/DepthChart.tsx | • Xóa bỏ thuật toán fake orderbook bằng seed/random.<br>• Hiển thị đúng depth thật từ DreamDEX CLOB, nếu trống báo 'Waiting for liquidity'. |
| **Giao diện Cockpit chính** | src/ui/App.tsx | • Cập nhật interface Market có strikePrice, expirationTime, interval.<br>• Xóa bỏ FALLBACK_MARKETS đè data thật.<br>• Sửa số lượng 561 ACTIVE thành {filteredMarkets.length} ACTIVE. |
| **Trung tâm Định lượng** | src/ui/components/AnalyticsView.tsx | • Gom toàn bộ thuật toán phân tích: Orderbook Imbalance, Spread Velocity, Black-Scholes Fair Value, Volatility Index vào một dashboard hoàn chỉnh. |

---

## 3. CHECKLIST KIỂM THỬ NGHIỆM THU (ACCEPTANCE CRITERIA)
- [ ] Mọi cặp tiền hiển thị trên sidebar đều đến từ DreamDEX indexer (dev.smk.somnia.host).
- [ ] Điểm Strike Price hiển thị chính xác theo USD (ví dụ: BTC ,947.56, ETH ,500.35).
- [ ] Không còn bất kỳ mã nguồn nào dùng Math.random() để giả vờ tạo giao dịch hay fake orderbook.
- [ ] Form đặt lệnh không còn TP/SL, chỉ tập trung vào BUY YES/NO và payout theo round.
- [ ] Màn hình AnalyticsView hiển thị đầy đủ các chỉ số định lượng thời gian thực.