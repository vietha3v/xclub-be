# Calculations - X-Club System

## Tổng quan
Tài liệu này mô tả các công thức tính toán chính được sử dụng trong hệ thống X-Club - ứng dụng quản lý câu lạc bộ chạy bộ với khả năng đồng bộ dữ liệu từ các nền tảng bên ngoài.

## 1. Tính toán hoạt động chạy bộ (Activity Calculations)

### 1.1 Tốc độ trung bình
```
Tốc độ trung bình (km/h) = Khoảng cách (km) / Thời gian (giờ)
Tốc độ trung bình (phút/km) = Thời gian (phút) / Khoảng cách (km)
```

**Ví dụ:**
- Khoảng cách: 10 km
- Thời gian: 45 phút = 0.75 giờ
- Tốc độ trung bình: 10 / 0.75 = 13.33 km/h
- Pace: 45 / 10 = 4.5 phút/km

### 1.2 Calories tiêu thụ
```
Calories = MET × Trọng lượng (kg) × Thời gian (giờ)
```

**MET values cho các hoạt động:**
- Walking (3-4 mph): 3.5-4.5 MET
- Jogging: 7.0 MET
- Running (5.2 mph): 8.3 MET
- Running (6.7 mph): 10.5 MET
- Running (7.5 mph): 11.5 MET
- Running (8.6 mph): 12.8 MET
- Running (10.0 mph): 14.5 MET

**Ví dụ:**
- Hoạt động: Running 10 km trong 45 phút
- Trọng lượng: 70 kg
- MET: 10.5 (tốc độ 6.7 mph)
- Calories: 10.5 × 70 × 0.75 = 551.25 kcal

### 1.3 Chỉ số VO2 Max ước tính
```
VO2 Max (ml/kg/min) = 15.3 × (HRmax / HRrest)
```

**Trong đó:**
- HRmax: Nhịp tim tối đa
- HRrest: Nhịp tim nghỉ ngơi

**Công thức HRmax:**
- Nam: 220 - Tuổi
- Nữ: 226 - Tuổi

### 1.4 Chỉ số RPE (Rate of Perceived Exertion)
```
RPE Scale: 1-10
1: Rất nhẹ (ngồi yên)
5: Trung bình (đi bộ nhanh)
10: Rất nặng (chạy nước rút tối đa)
```

## 2. Tính toán thành tích và gamification (Achievement & Gamification)

### 2.1 Điểm thành tích
```
Điểm cơ bản = Khoảng cách (km) × Hệ số loại hoạt động
Điểm bonus = Điểm cơ bản × Hệ số thời gian × Hệ số địa hình
```

**Hệ số loại hoạt động:**
- Walking: 1.0
- Jogging: 1.2
- Running: 1.5
- Trail Running: 1.8
- Trekking: 2.0

**Hệ số thời gian:**
- Sáng sớm (5-7h): 1.1
- Giờ cao điểm (7-9h): 1.0
- Giờ thấp điểm (9-17h): 0.9
- Chiều tối (17-19h): 1.0
- Tối (19-22h): 1.1

**Hệ số địa hình:**
- Đường phẳng: 1.0
- Đường dốc nhẹ: 1.2
- Đường dốc vừa: 1.5
- Đường dốc cao: 2.0
- Đường mòn: 1.8

### 2.2 Level và XP
```
XP cần thiết cho level N = 100 × N^1.5
Level hiện tại = √(XP hiện tại / 100)
```

**Ví dụ:**
- Level 1: 100 XP
- Level 2: 283 XP
- Level 3: 520 XP
- Level 10: 3,162 XP

### 2.3 Streak (chuỗi liên tiếp)
```
Streak hiện tại = Số ngày liên tiếp có hoạt động
Streak tối đa = Streak cao nhất từ trước đến nay
```

**Bonus streak:**
- 7 ngày liên tiếp: +10% điểm
- 30 ngày liên tiếp: +25% điểm
- 100 ngày liên tiếp: +50% điểm

## 3. Tính toán xếp hạng và leaderboard (Ranking & Leaderboard)

### 3.1 Điểm xếp hạng tổng hợp
```
Điểm xếp hạng = (Điểm hoạt động × 0.4) + (Điểm thành tích × 0.3) + (Điểm cộng đồng × 0.3)
```

**Trong đó:**
- Điểm hoạt động: Tổng điểm từ các hoạt động
- Điểm thành tích: Điểm từ huy chương và achievements
- Điểm cộng đồng: Điểm từ tương tác xã hội

### 3.2 Xếp hạng theo thời gian
```
Xếp hạng = Sắp xếp theo thời gian hoàn thành (tăng dần)
```

**Xử lý tie-break:**
1. Thời gian hoàn thành
2. Thời gian đăng ký
3. ID người dùng (ngẫu nhiên)

### 3.3 Xếp hạng theo khoảng cách
```
Xếp hạng = Sắp xếp theo tổng khoảng cách (giảm dần)
```

**Tính toán tổng khoảng cách:**
- Theo ngày
- Theo tuần
- Theo tháng
- Theo năm

## 4. Tính toán hiệu suất và tiến độ (Performance & Progress)

### 4.1 Chỉ số cải thiện
```
Cải thiện (%) = ((Thời gian cũ - Thời gian mới) / Thời gian cũ) × 100
```

**Ví dụ:**
- Lần chạy trước: 45 phút cho 10 km
- Lần chạy này: 42 phút cho 10 km
- Cải thiện: ((45 - 42) / 45) × 100 = 6.67%

### 4.2 Chỉ số ổn định
```
Độ lệch chuẩn = √(Σ(xi - x̄)² / n)
Hệ số biến thiên = (Độ lệch chuẩn / Giá trị trung bình) × 100
```

**Đánh giá ổn định:**
- < 5%: Rất ổn định
- 5-10%: Ổn định
- 10-15%: Tương đối ổn định
- > 15%: Không ổn định

### 4.3 Dự đoán thời gian
```
Thời gian dự đoán = Thời gian cơ bản × Hệ số điều kiện
```

**Hệ số điều kiện:**
- Thời tiết tốt: 1.0
- Thời tiết xấu: 1.1
- Đường dốc: 1.2
- Đường mòn: 1.15
- Mệt mỏi: 1.1

## 5. Tính toán thống kê câu lạc bộ (Club Statistics)

### 5.1 Hoạt động trung bình
```
Hoạt động trung bình/người = Tổng hoạt động / Số thành viên
Khoảng cách trung bình/người = Tổng khoảng cách / Số thành viên
```

### 5.2 Tỷ lệ tham gia
```
Tỷ lệ tham gia = (Số thành viên hoạt động / Tổng số thành viên) × 100
```

**Phân loại:**
- Cao: > 80%
- Trung bình: 50-80%
- Thấp: < 50%

### 5.3 Hiệu quả sự kiện
```
Tỷ lệ hoàn thành = (Số người hoàn thành / Số người đăng ký) × 100
Điểm đánh giá trung bình = Tổng điểm đánh giá / Số đánh giá
```

## 6. Tính toán tích hợp dữ liệu (Data Integration Calculations)

### 6.1 Độ tin cậy dữ liệu
```
Độ tin cậy = (Số điểm dữ liệu hợp lệ / Tổng số điểm dữ liệu) × 100
```

**Tiêu chí hợp lệ:**
- GPS accuracy < 10m
- Heart rate trong khoảng 40-220 BPM
- Speed trong khoảng 0-30 km/h

### 6.2 Độ chính xác đồng bộ
```
Độ chính xác = (Số hoạt động đồng bộ thành công / Tổng số hoạt động) × 100
```

### 6.3 Thời gian đồng bộ
```
Thời gian đồng bộ trung bình = Tổng thời gian đồng bộ / Số lần đồng bộ
```

## 7. Tính toán thanh toán và phí dịch vụ (Payment & Fee Calculations)

### 7.1 Phí thành viên
```
Phí thành viên = Phí cơ bản × Hệ số thời gian × Hệ số ưu đãi
```

**Hệ số thời gian:**
- Tháng: 1.0
- Quý: 0.9
- Năm: 0.8

**Hệ số ưu đãi:**
- Thành viên mới: 1.0
- Thành viên cũ: 0.95
- Thành viên VIP: 0.9

### 7.2 Phí sự kiện
```
Phí sự kiện = Phí cơ bản + Phí dịch vụ bổ sung + Thuế
```

**Thuế:**
- VAT: 10% (nếu áp dụng)
- Thuế thu nhập: Theo quy định địa phương

### 7.3 Hoàn tiền
```
Số tiền hoàn = Số tiền đã thanh toán × Tỷ lệ hoàn tiền
```

**Tỷ lệ hoàn tiền:**
- Hủy trước 7 ngày: 100%
- Hủy trước 3 ngày: 50%
- Hủy trước 1 ngày: 25%
- Hủy trong ngày: 0%

## 8. Tính toán phân tích dữ liệu (Data Analytics Calculations)

### 8.1 Chỉ số tăng trưởng
```
Tốc độ tăng trưởng = ((Giá trị hiện tại - Giá trị trước) / Giá trị trước) × 100
```

### 8.2 Chỉ số xu hướng
```
Đường xu hướng = a × x + b
```

**Trong đó:**
- a: Hệ số góc (tốc độ thay đổi)
- b: Hệ số tự do
- x: Thời gian

### 8.3 Dự báo
```
Dự báo = Giá trị hiện tại × (1 + Tốc độ tăng trưởng trung bình)^n
```

**Trong đó:**
- n: Số chu kỳ trong tương lai

## 9. Tính toán hiệu suất hệ thống (System Performance Calculations)

### 9.1 Thời gian phản hồi
```
Thời gian phản hồi trung bình = Tổng thời gian phản hồi / Số request
```

### 9.2 Tỷ lệ thành công
```
Tỷ lệ thành công = (Số request thành công / Tổng số request) × 100
```

### 9.3 Throughput
```
Throughput = Số request xử lý / Thời gian xử lý
```

## 10. Công thức tối ưu hóa (Optimization Formulas)

### 10.1 Tối ưu hóa truy vấn database
```
Thời gian truy vấn = Thời gian đọc + Thời gian xử lý + Thời gian ghi
```

**Tối ưu hóa:**
- Sử dụng index phù hợp
- Giới hạn số lượng kết quả
- Sử dụng pagination

### 10.2 Tối ưu hóa cache
```
Hit rate = (Số request cache hit / Tổng số request) × 100
```

**Mục tiêu:**
- Hit rate > 80%
- Response time < 100ms

### 10.3 Tối ưu hóa memory
```
Memory usage = (Memory đang sử dụng / Memory khả dụng) × 100
```

**Mục tiêu:**
- Memory usage < 70%
- Garbage collection < 100ms

## Kết luận

Các công thức tính toán này đảm bảo hệ thống X-Club hoạt động chính xác và hiệu quả. Việc áp dụng đúng các công thức giúp cung cấp thông tin chính xác cho người dùng và hỗ trợ ra quyết định dựa trên dữ liệu.
