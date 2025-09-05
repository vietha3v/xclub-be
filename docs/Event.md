# Event Module - Quản lý sự kiện chạy bộ

## **1. Tổng quan module**

### **1.1 Mục đích**
Module Event quản lý các sự kiện chạy bộ trong cộng đồng X-Club, bao gồm việc tạo sự kiện, quản lý thử thách (challenges), theo dõi tiến độ và trao huy chương cho người tham gia.

### **1.2 Phạm vi**
- **Quản lý sự kiện**: Tạo, cập nhật, xóa các sự kiện chạy bộ
- **Quản lý thử thách**: Mỗi sự kiện có thể có 1 hoặc nhiều thử thách
- **Theo dõi tiến độ**: Real-time tracking tiến độ người tham gia
- **Bảng xếp hạng**: Cập nhật liên tục theo tiến độ
- **Huy chương**: Tự động trao khi hoàn thành thử thách
- **Không quản lý**: Hoạt động chạy bộ cụ thể, thanh toán

---

## **2. Kiến trúc Event-Challenge**

### **2.1 Mối quan hệ chính**
```
Event (1) ←→ (N) Challenge (1) ←→ (N) Challenge_Participant
                ↓
            Achievement (Huy chương)
                ↓
        User_Achievement (Thành tích người dùng)
```

### **2.2 Cấu trúc dữ liệu**
- **Event**: Sự kiện chính (training, competition, social, charity)
- **Challenge**: Thử thách trong sự kiện (distance, frequency, speed, time, combined)
- **Challenge_Participant**: Người tham gia thử thách với tiến độ
- **Challenge_Leaderboard**: Bảng xếp hạng real-time
- **Achievement**: Huy chương liên kết với thử thách

---

## **3. Chức năng chính**

### **3.1 Quản lý sự kiện**
- **Tạo sự kiện**: Admin CLB tạo sự kiện mới
- **Cập nhật sự kiện**: Sửa đổi thông tin, thời gian, địa điểm
- **Xóa sự kiện**: Gỡ bỏ sự kiện không còn phù hợp
- **Tìm kiếm sự kiện**: Lọc theo loại, trạng thái, thời gian, CLB

### **3.2 Quản lý thử thách**
- **Tạo thử thách**: Thiết lập mục tiêu, điều kiện, phần thưởng
- **Cập nhật thử thách**: Sửa đổi mục tiêu, điều kiện
- **Xóa thử thách**: Gỡ bỏ thử thách không còn phù hợp
- **Quản lý thử thách**: Theo dõi tiến độ, cập nhật bảng xếp hạng

### **3.3 Quản lý tham gia**
- **Đăng ký tham gia**: Thành viên đăng ký tham gia thử thách
- **Theo dõi tiến độ**: Real-time tracking từ hoạt động chạy bộ
- **Bảng xếp hạng**: Cập nhật liên tục theo tiến độ
- **Thống kê tham gia**: Số lượng người tham gia, tỷ lệ hoàn thành

### **3.4 Hệ thống huy chương**
- **Tự động trao**: Khi hoàn thành thử thách
- **Huy chương đa cấp**: Bronze, Silver, Gold, Platinum, Diamond
- **Chứng nhận**: Tạo chứng nhận hoàn thành
- **Điểm thưởng**: Hệ thống điểm tích lũy

---

## **4. Quy trình hoạt động**

### **4.1 Quy trình tạo sự kiện**
1. **Admin CLB tạo sự kiện**: Thiết lập thông tin cơ bản, thời gian, địa điểm
2. **Tạo thử thách**: Thiết lập các thử thách trong sự kiện
3. **Công bố sự kiện**: Thông báo cho toàn bộ thành viên CLB
4. **Thành viên đăng ký**: Đăng ký tham gia các thử thách
5. **Bắt đầu sự kiện**: Theo dõi tiến độ từ hoạt động chạy bộ
6. **Cập nhật tiến độ**: Tự động cập nhật từ dữ liệu Strava/Garmin
7. **Kết thúc sự kiện**: Trao huy chương và công bố kết quả

### **4.2 Quy trình tham gia thử thách**
1. **Xem danh sách thử thách**: Lọc theo sở thích và khả năng
2. **Đăng ký tham gia**: Chọn thử thách phù hợp
3. **Theo dõi tiến độ**: Xem tiến độ hoàn thành real-time
4. **Cập nhật hoạt động**: Đồng bộ từ ứng dụng chạy bộ
5. **Xem bảng xếp hạng**: So sánh với các thành viên khác
6. **Hoàn thành thử thách**: Nhận huy chương và chứng nhận

---

## **5. Các loại thử thách**

### **5.1 Thử thách quãng đường**
- **Mục tiêu**: Chạy tổng cộng X km trong thời gian nhất định
- **Ví dụ**: "Tháng 100km", "Tuần 25km"
- **Điều kiện**: Tổng quãng đường từ tất cả hoạt động chạy bộ

### **5.2 Thử thách tần suất**
- **Mục tiêu**: Chạy X ngày liên tiếp
- **Ví dụ**: "7 ngày liên tiếp", "30 ngày liên tiếp"
- **Điều kiện**: Chuỗi liên tiếp không bị gián đoạn

### **5.3 Thử thách tốc độ**
- **Mục tiêu**: Đạt pace hoặc tốc độ mục tiêu
- **Ví dụ**: "Pace 5:00/km", "Tốc độ 12km/h"
- **Điều kiện**: Tốc độ trung bình đạt mục tiêu

### **5.4 Thử thách thời gian**
- **Mục tiêu**: Chạy trong khoảng thời gian cụ thể
- **Ví dụ**: "Chạy sáng 6-7h", "Chạy tối 19-20h"
- **Điều kiện**: Hoạt động trong khung giờ quy định

### **5.5 Thử thách kết hợp**
- **Mục tiêu**: Kết hợp nhiều tiêu chí khác nhau
- **Ví dụ**: "7 ngày liên tiếp, mỗi ngày ít nhất 5km"
- **Điều kiện**: Đáp ứng tất cả tiêu chí

---

## **6. Lợi ích của hệ thống**

### **6.1 Đối với thành viên**
- **Tạo động lực**: Có mục tiêu cụ thể để phấn đấu
- **Cạnh tranh lành mạnh**: So sánh thành tích với người khác
- **Ghi nhận thành tích**: Nhận huy chương và chứng nhận
- **Phát triển kỹ năng**: Cải thiện khả năng chạy bộ
- **Theo dõi tiến độ**: Real-time tracking tiến độ

### **6.2 Đối với CLB**
- **Tăng tương tác**: Thúc đẩy thành viên tham gia hoạt động
- **Xây dựng cộng đồng**: Tạo môi trường giao lưu và thi đấu
- **Thu hút thành viên mới**: Tạo điểm hấp dẫn cho runner mới
- **Đo lường hiệu quả**: Theo dõi hoạt động của thành viên
- **Tạo nội dung**: Sinh ra các hoạt động và tương tác mới

### **6.3 Đối với hệ thống**
- **Tăng hoạt động**: Khuyến khích người dùng sử dụng hệ thống
- **Thu thập dữ liệu**: Có thêm dữ liệu hoạt động để phân tích
- **Tạo nội dung**: Sinh ra các hoạt động và tương tác mới
- **Phát triển tính năng**: Cơ sở để phát triển các tính năng nâng cao

---

## **7. Ví dụ thực tế**

### **7.1 Sự kiện "Tháng chạy bộ cộng đồng"**
- **Thời gian**: 1 tháng
- **Thử thách 1**: "7 ngày liên tiếp" - Chạy ít nhất 5km mỗi ngày trong 7 ngày liên tiếp
- **Thử thách 2**: "Tháng 100km" - Chạy tổng cộng 100km trong 1 tháng
- **Thử thách 3**: "Pace Master" - Đạt pace 5:30/km trong ít nhất 10 hoạt động
- **Phần thưởng**: Huy chương "Streak Master", "Century Runner", "Pace Master"

### **7.2 Sự kiện "Weekend Challenge"**
- **Thời gian**: Cuối tuần (2 ngày)
- **Thử thách 1**: "Double Distance" - Chạy gấp đôi quãng đường so với tuần trước
- **Thử thách 2**: "Speed Burst" - Đạt tốc độ tối đa 15km/h trong ít nhất 1 hoạt động
- **Phần thưởng**: Huy chương "Weekend Warrior", "Speed Demon"

---

## **8. Kết luận**

Module Event với kiến trúc Event-Challenge cung cấp **nền tảng hoàn chỉnh** cho việc tổ chức sự kiện chạy bộ:

- **Linh hoạt**: 1 Event có thể có nhiều Challenge khác nhau
- **Real-time**: Theo dõi tiến độ và cập nhật bảng xếp hạng liên tục
- **Tự động**: Tự động trao huy chương khi hoàn thành thử thách
- **Tích hợp**: Liên kết chặt chẽ với hoạt động chạy bộ từ Strava/Garmin
- **Gamification**: Hệ thống huy chương và điểm thưởng tạo động lực

Module này là **cốt lõi** của hệ thống X-Club, tạo ra môi trường thi đấu và thử thách hấp dẫn cho cộng đồng chạy bộ.