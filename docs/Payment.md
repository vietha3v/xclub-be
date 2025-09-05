# Payment Module - Hệ thống thanh toán

## **1. Tổng quan module**

### **1.1 Mục đích**
Module Payment quản lý tất cả các giao dịch thanh toán trong hệ thống X-Club, bao gồm phí tham gia sự kiện, phí thành viên CLB, phí đăng ký giải chạy và các khoản thanh toán khác.

### **1.2 Phạm vi**
- **Quản lý thanh toán**: Xử lý các giao dịch thanh toán trực tuyến
- **Quản lý hóa đơn**: Tạo và quản lý hóa đơn thanh toán
- **Quản lý hoàn tiền**: Xử lý yêu cầu hoàn tiền khi cần thiết
- **Không quản lý**: Hoạt động chạy bộ cụ thể, nội dung sự kiện

---

## **2. Chức năng chính của hệ thống**

### **2.1 Các loại thanh toán**
- **Phí tham gia sự kiện**: Đăng ký tham gia các sự kiện và challenge
- **Phí đăng ký giải chạy**: Mua bib tham gia các giải chạy
- **Phí thành viên CLB**: Phí hàng tháng/năm để duy trì tư cách thành viên
- **Phí gây quỹ từ thiện**: Đóng góp cho các sự kiện gây quỹ
- **Phí dịch vụ bổ sung**: Dịch vụ VIP, ưu đãi đặc biệt

### **2.2 Phương thức thanh toán**
- **VNPay**: Cổng thanh toán trực tuyến phổ biến tại Việt Nam
- **Momo**: Ví điện tử được sử dụng rộng rãi
- **ZaloPay**: Ví điện tử của Zalo
- **Chuyển khoản ngân hàng**: Chuyển tiền trực tiếp
- **Tiền mặt**: Thanh toán trực tiếp tại sự kiện

### **2.3 Quản lý giao dịch**
- **Xử lý thanh toán**: Tự động xử lý các giao dịch thanh toán
- **Xác nhận thanh toán**: Gửi xác nhận khi thanh toán thành công
- **Theo dõi trạng thái**: Cập nhật trạng thái giao dịch real-time
- **Lưu trữ lịch sử**: Ghi lại toàn bộ lịch sử giao dịch

---

## **3. Quy trình hoạt động**

### **3.1 Quy trình thanh toán**
1. **Người dùng chọn dịch vụ**: Chọn sự kiện, giải chạy hoặc dịch vụ
2. **Hệ thống tính phí**: Tự động tính toán phí tham gia
3. **Chọn phương thức thanh toán**: VNPay, Momo, ZaloPay, chuyển khoản
4. **Thực hiện thanh toán**: Chuyển đến cổng thanh toán tương ứng
5. **Xác nhận kết quả**: Nhận kết quả thanh toán từ cổng thanh toán
6. **Cập nhật trạng thái**: Cập nhật trạng thái đăng ký và gửi xác nhận

### **3.2 Quy trình hoàn tiền**
1. **Người dùng yêu cầu hoàn tiền**: Gửi yêu cầu hoàn tiền
2. **Kiểm tra điều kiện**: Xác minh điều kiện hoàn tiền
3. **Phê duyệt hoàn tiền**: Admin phê duyệt yêu cầu hoàn tiền
4. **Thực hiện hoàn tiền**: Chuyển tiền về tài khoản người dùng
5. **Cập nhật trạng thái**: Cập nhật trạng thái giao dịch
6. **Gửi xác nhận**: Thông báo hoàn tiền thành công

---

## **4. Lợi ích của hệ thống**

### **4.1 Đối với người dùng**
- **Thanh toán thuận tiện**: Nhiều phương thức thanh toán linh hoạt
- **Bảo mật thông tin**: Thông tin thanh toán được bảo vệ an toàn
- **Theo dõi giao dịch**: Xem lịch sử thanh toán chi tiết
- **Hoàn tiền dễ dàng**: Quy trình hoàn tiền minh bạch và nhanh chóng

### **4.2 Đối với CLB và Ban tổ chức**
- **Quản lý tài chính hiệu quả**: Theo dõi doanh thu và chi phí
- **Tự động hóa**: Giảm thiểu công việc thủ công
- **Báo cáo chi tiết**: Thống kê tài chính theo thời gian
- **Tăng doanh thu**: Dễ dàng thu phí từ người tham gia

### **4.3 Đối với hệ thống**
- **Tính chuyên nghiệp**: Hệ thống thanh toán hiện đại và đáng tin cậy
- **Tích hợp dễ dàng**: Kết nối với nhiều cổng thanh toán
- **Bảo mật cao**: Tuân thủ các tiêu chuẩn bảo mật quốc tế
- **Mở rộng quy mô**: Hỗ trợ nhiều loại giao dịch khác nhau

---

## **5. Ví dụ thực tế**

### **5.1 Thanh toán tham gia sự kiện**
- **Dịch vụ**: Tham gia challenge "Tháng 100km"
- **Phí tham gia**: 50,000 VND
- **Phương thức**: VNPay
- **Quy trình**: Đăng ký → Chọn VNPay → Thanh toán → Xác nhận tham gia

### **5.2 Thanh toán đăng ký giải chạy**
- **Dịch vụ**: Đăng ký giải chạy "Hà Nội Marathon" - Half Marathon
- **Phí tham gia**: 500,000 VND
- **Phương thức**: Momo
- **Quy trình**: Chọn cự ly → Chọn Momo → Thanh toán → Nhận bib

### **5.3 Thanh toán phí thành viên CLB**
- **Dịch vụ**: Phí thành viên hàng tháng CLB "Hà Nội Runners"
- **Phí thành viên**: 100,000 VND/tháng
- **Phương thức**: Chuyển khoản ngân hàng
- **Quy trình**: Nhắc nhở → Chuyển khoản → Xác nhận → Duy trì tư cách

### **5.4 Thanh toán gây quỹ từ thiện**
- **Dịch vụ**: Đóng góp cho sự kiện "Chạy vì trẻ em"
- **Số tiền đóng góp**: 200,000 VND
- **Phương thức**: ZaloPay
- **Quy trình**: Chọn số tiền → Chọn ZaloPay → Thanh toán → Cập nhật tiến độ gây quỹ

---

## **6. Tương tác với các module khác**

### **6.1 Module Event**
- **Phí tham gia**: Xử lý thanh toán phí tham gia sự kiện
- **Xác nhận tham gia**: Cập nhật trạng thái tham gia sau khi thanh toán
- **Quản lý danh sách**: Theo dõi người đã thanh toán và chưa thanh toán

### **6.2 Module Race**
- **Phí đăng ký**: Xử lý thanh toán phí đăng ký giải chạy
- **Bán bib**: Quản lý việc bán vé tham gia giải chạy
- **Quản lý tham gia**: Theo dõi người đã đăng ký và thanh toán

### **6.3 Module Club**
- **Phí thành viên**: Xử lý thanh toán phí thành viên CLB
- **Quản lý tài chính**: Theo dõi doanh thu từ phí thành viên
- **Tư cách thành viên**: Duy trì tư cách thành viên dựa trên thanh toán

### **6.4 Module Fundraising**
- **Đóng góp từ thiện**: Xử lý các khoản đóng góp từ thiện
- **Cập nhật tiến độ**: Cập nhật tiến độ gây quỹ real-time
- **Báo cáo minh bạch**: Thống kê chi tiết các khoản đóng góp

---

**Tài liệu này mô tả chức năng của Payment Module trong hệ thống X-Club, tập trung vào việc xử lý các giao dịch thanh toán và quản lý tài chính cho toàn bộ hệ thống.**
