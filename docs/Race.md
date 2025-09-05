# Race Module - Quản lý giải chạy

## **1. Tổng quan module**

### **1.1 Mục đích**
Module Race quản lý các giải chạy chính thức, bao gồm giải chạy ảo (virtual race) và giải chạy thực, với khả năng bán bib, quản lý đăng ký và trao giải.

### **1.2 Phạm vi**
- **Quản lý giải chạy**: Tạo, cập nhật, xóa các giải chạy
- **Quản lý đăng ký**: Bán bib, quản lý danh sách tham gia
- **Quản lý kết quả**: Ghi nhận thành tích, xếp hạng, trao giải
- **Không quản lý**: Hoạt động chạy bộ cụ thể, thanh toán chi tiết

---

## **2. Chức năng chính của hệ thống**

### **2.1 Quản lý giải chạy**
- **Tạo giải chạy mới**: Thiết lập thông tin, cự ly, thời gian, địa điểm
- **Cập nhật giải chạy**: Sửa đổi thông tin, quy tắc, điều kiện tham gia
- **Xóa giải chạy**: Gỡ bỏ giải chạy không còn phù hợp
- **Tìm kiếm giải chạy**: Lọc theo loại, cự ly, địa điểm, thời gian

### **2.2 Các loại giải chạy**
- **Giải chạy ảo (Virtual Race)**: Cho phép tham gia từ bất kỳ đâu
- **Giải chạy thực**: Tổ chức tại địa điểm cụ thể
- **Giải chạy kết hợp**: Kết hợp cả ảo và thực
- **Giải chạy gây quỹ**: Kết hợp chạy bộ với hoạt động từ thiện

### **2.3 Các cự ly chạy**
- **5K**: Chạy 5km (phù hợp người mới bắt đầu)
- **10K**: Chạy 10km (trung cấp)
- **Half Marathon**: Chạy 21.1km (nâng cao)
- **Marathon**: Chạy 42.2km (chuyên nghiệp)
- **Ultra**: Chạy trên 42.2km (cực đoan)

### **2.4 Quản lý đăng ký**
- **Bán bib**: Quản lý việc bán vé tham gia giải chạy
- **Quản lý danh sách**: Theo dõi người đăng ký, trạng thái thanh toán
- **Phân loại tham gia**: Theo độ tuổi, giới tính, kinh nghiệm
- **Giới hạn tham gia**: Thiết lập số lượng người tham gia tối đa

---

## **3. Quy trình hoạt động**

### **3.1 Quy trình tạo giải chạy**
1. **Ban tổ chức tạo giải chạy**: Thiết lập thông tin cơ bản
2. **Cấu hình chi tiết**: Cự ly, thời gian, địa điểm, quy tắc
3. **Thiết lập đăng ký**: Phí tham gia, thời gian đăng ký, giới hạn
4. **Công bố giải chạy**: Thông báo cho cộng đồng runner
5. **Mở đăng ký**: Bắt đầu nhận đăng ký từ người tham gia
6. **Tổ chức giải chạy**: Thực hiện giải chạy theo kế hoạch

### **3.2 Quy trình tham gia giải chạy**
1. **Xem danh sách giải chạy**: Lọc theo sở thích và khả năng
2. **Đăng ký tham gia**: Chọn cự ly và đóng phí tham gia
3. **Nhận bib**: Nhận số báo danh và thông tin tham gia
4. **Tham gia giải chạy**: Chạy theo cự ly đã đăng ký
5. **Ghi nhận kết quả**: Hệ thống tự động ghi nhận từ Strava/Garmin
6. **Nhận giải thưởng**: Huy chương, chứng nhận, phần thưởng

### **3.3 Quy trình gây quỹ từ thiện**
1. **Tạo giải chạy gây quỹ**: Thiết lập mục tiêu tiền và đơn vị nhận quỹ
2. **Đăng ký tham gia**: Runner đăng ký và đóng phí tham gia
3. **Theo dõi tiến độ**: Hiển thị tiến độ gây quỹ và số km đã chạy
4. **Cập nhật real-time**: Cập nhật số tiền gây quỹ theo hoạt động chạy bộ
5. **Hoàn thành**: Trao huy chương và báo cáo kết quả gây quỹ
6. **Giải ngân**: Chuyển tiền cho đơn vị nhận quỹ

---

## **4. Lợi ích của hệ thống**

### **4.1 Đối với Runner**
- **Tham gia giải chạy**: Có cơ hội tham gia các giải chạy chuyên nghiệp
- **Ghi nhận thành tích**: Nhận huy chương và chứng nhận chính thức
- **So sánh khả năng**: Đánh giá trình độ so với cộng đồng
- **Đóng góp xã hội**: Tham gia gây quỹ từ thiện thông qua chạy bộ

### **4.2 Đối với Ban tổ chức**
- **Quản lý hiệu quả**: Hệ thống quản lý đăng ký và tham gia tự động
- **Tiết kiệm chi phí**: Giảm thiểu công việc thủ công
- **Mở rộng quy mô**: Có thể tổ chức giải chạy lớn hơn
- **Tăng doanh thu**: Bán bib và dịch vụ bổ sung

### **4.3 Đối với CLB**
- **Tổ chức giải chạy**: Tạo giải chạy riêng cho thành viên
- **Tăng tương tác**: Thúc đẩy thành viên tham gia hoạt động
- **Tạo danh tiếng**: Tổ chức giải chạy chuyên nghiệp
- **Thu hút thành viên mới**: Tạo điểm hấp dẫn cho runner mới

---

## **5. Ví dụ thực tế**

### **5.1 Giải chạy ảo "Chạy vì trẻ em"**
- **Loại**: Virtual Race gây quỹ từ thiện
- **Cự ly**: 5K, 10K, Half Marathon
- **Thời gian**: 1 tháng
- **Mục tiêu gây quỹ**: 100 triệu VND
- **Đơn vị nhận quỹ**: Quỹ hỗ trợ trẻ em khó khăn
- **Phần thưởng**: Huy chương ảo, chứng nhận online

### **5.2 Giải chạy thực "Hà Nội Marathon"**
- **Loại**: Giải chạy thực tại địa điểm
- **Cự ly**: 5K, 10K, Half Marathon, Marathon
- **Địa điểm**: Hồ Tây, Hà Nội
- **Thời gian**: 1 ngày
- **Số lượng tham gia**: 5,000 runner
- **Phần thưởng**: Huy chương thực, chứng nhận, giải thưởng tiền mặt

### **5.3 Giải chạy CLB "Weekend Challenge"**
- **Loại**: Giải chạy nội bộ CLB
- **Cự ly**: 10K
- **Thời gian**: Cuối tuần
- **Thành viên tham gia**: Chỉ dành cho thành viên CLB
- **Phần thưởng**: Huy chương CLB, điểm tích lũy

---

## **6. Tương tác với các module khác**

### **6.1 Module Club**
- **Tổ chức giải chạy**: CLB có thể tổ chức giải chạy riêng
- **Quản lý thành viên**: Theo dõi thành viên tham gia giải chạy
- **Thống kê CLB**: Xem hiệu quả giải chạy đối với CLB

### **6.2 Module Activity**
- **Đồng bộ dữ liệu**: Lấy hoạt động chạy bộ từ Strava/Garmin
- **Ghi nhận kết quả**: Tự động ghi nhận thành tích giải chạy
- **Xác thực hoàn thành**: Đảm bảo thành tích là chính xác

### **6.3 Module Achievement**
- **Trao huy chương**: Tự động trao huy chương khi hoàn thành
- **Chứng nhận**: Tạo chứng nhận hoàn thành giải chạy
- **Bộ sưu tập**: Thêm vào bộ sưu tập thành tích cá nhân

### **6.4 Module Payment**
- **Thanh toán phí tham gia**: Xử lý thanh toán đăng ký giải chạy
- **Quản lý tài chính**: Theo dõi doanh thu và chi phí
- **Hoàn tiền**: Xử lý yêu cầu hoàn tiền khi cần thiết

---

**Tài liệu này mô tả chức năng của Race Module trong hệ thống X-Club, tập trung vào việc quản lý các giải chạy chính thức và tạo cơ hội tham gia thi đấu cho cộng đồng runner.**
