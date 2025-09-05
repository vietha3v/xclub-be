# **Tài liệu tổng quan dự án X-Club**

## **1. Giới thiệu dự án**

### **1.1 Tên dự án**
**X-Club** - Hệ thống cộng đồng chạy bộ thông minh

### **1.2 Mục tiêu dự án**
Xây dựng nền tảng kết nối cộng đồng chạy bộ thông qua việc tạo lập và quản lý các Câu lạc bộ (CLB), tổ chức sự kiện, challenge và giải chạy với khả năng gây quỹ từ thiện ý nghĩa.

### **1.3 Đặc điểm cốt lõi**
- **Cộng đồng hóa**: Tạo môi trường kết nối giữa các runner
- **Sự kiện hóa**: Biến hoạt động chạy bộ thành các sự kiện có mục tiêu
- **Gây quỹ từ thiện**: Kết hợp thể thao với hoạt động xã hội
- **Công nghệ hiện đại**: Tích hợp với các ứng dụng thể thao hàng đầu

### **1.4 Slogan**
**"Chạy và kết nối"** - Thể hiện mục tiêu kết hợp giữa hoạt động chạy bộ và việc tạo dựng những kết nối ý nghĩa trong cộng đồng.

---

## **2. Tổng quan hệ thống**

### **2.1 Mô hình hoạt động**
```
CLB Chạy bộ → Tạo sự kiện/Challenge → Thành viên tham gia → 
Đồng bộ hoạt động từ Strava/Garmin → Cập nhật tiến độ → 
Bảng xếp hạng → Trao huy chương/Chứng nhận → Gây quỹ từ thiện
```

### **2.2 Đối tượng người dùng**
- **Runner cá nhân**: Người chạy bộ muốn tham gia cộng đồng
- **CLB chạy bộ**: Tổ chức muốn quản lý thành viên và hoạt động
- **Ban tổ chức sự kiện**: Đơn vị muốn tổ chức giải chạy
- **Tổ chức từ thiện**: Đơn vị nhận quỹ từ các sự kiện

---

## **3. Chức năng chính của hệ thống**

### **3.1 Quản lý CLB chạy bộ**
- **Tạo và quản lý CLB**: Thiết lập thông tin, logo, quy tắc, lịch hoạt động
- **Quản lý thành viên**: Thêm/xóa thành viên, phân quyền admin/moderator/member
- **Thiết lập CLB**: Cấu hình quyền riêng tư, yêu cầu phê duyệt thành viên mới

### **3.2 Hệ thống sự kiện và Challenge**
- **Tạo sự kiện**: Thiết lập mục tiêu cụ thể (quãng đường, thời gian, tần suất)
- **Challenge đa dạng**: 7 ngày liên tiếp, tháng chạy 100km, challenge tốc độ
- **Quản lý tham gia**: Đăng ký, theo dõi tiến độ, hiển thị bảng xếp hạng
- **Thúc đẩy hoạt động**: Tạo động lực cho thành viên thông qua cạnh tranh lành mạnh

### **3.3 Hệ thống giải chạy**
- **Giải chạy ảo (Virtual Race)**: Cho phép tham gia từ bất kỳ đâu
- **Giải chạy thực**: Tổ chức tại địa điểm cụ thể
- **Quản lý đăng ký**: Bán bib, quản lý danh sách tham gia
- **Đa dạng cự ly**: 5K, 10K, Half Marathon, Marathon, Ultra

### **3.4 Hệ thống huy chương và chứng nhận**
- **Huy chương ảo**: Thiết kế đẹp mắt cho từng sự kiện
- **Chứng nhận online**: Giấy chứng nhận hoàn thành có thể tải về
- **Bộ sưu tập cá nhân**: Người dùng có thể thu thập và chia sẻ thành tích
- **Phân loại huy chương**: Theo cự ly, thời gian, tần suất tham gia

### **3.5 Hệ thống gây quỹ từ thiện**
- **Sự kiện gây quỹ**: Kết hợp chạy bộ với hoạt động từ thiện
- **Mục tiêu gây quỹ**: Hướng tới trẻ em, giáo dục, sức khỏe, người có hoàn cảnh khó khăn
- **Hiệu ứng tiến độ**: Hiển thị tiến độ gây quỹ real-time
- **Danh sách đóng góp**: Công khai danh sách người đóng góp và số tiền
- **Báo cáo minh bạch**: Thống kê chi tiết việc sử dụng quỹ

---

## **4. Kiến trúc kỹ thuật**

### **4.1 Backend**
- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL với thiết kế độc lập
- **API**: RESTful API với JWT authentication
- **Real-time**: WebSocket cho cập nhật tiến độ và bảng xếp hạng

### **4.2 Frontend**
- **Web Platform**: Next.js cho quản trị và giao diện người dùng
- **Mobile App**: React Native (iOS/Android) - phát triển trong tương lai
- **UI Framework**: DaisyUI với thiết kế responsive

### **4.3 Tích hợp bên thứ 3**
- **Strava**: Đồng bộ hoạt động chạy bộ
- **Garmin**: Đồng bộ dữ liệu từ thiết bị Garmin
- **Apple Health**: Đồng bộ dữ liệu sức khỏe iOS
- **Google Fit**: Đồng bộ dữ liệu Android

---

## **5. Thiết kế database**

### **5.1 Nguyên tắc thiết kế**
- **Độc lập**: Mỗi bảng phục vụ một mục đích cụ thể
- **Hiệu suất**: Tối ưu cho truy vấn và mở rộng
- **Bảo mật**: Soft delete và audit trail
- **Tích hợp**: Hỗ trợ đồng bộ dữ liệu từ ứng dụng bên thứ 3

### **5.2 Các bảng chính**
- **clubs**: Thông tin CLB chạy bộ
- **events**: Sự kiện và challenge
- **races**: Giải chạy ảo và thực
- **activities**: Hoạt động chạy bộ (đồng bộ từ bên thứ 3)
- **achievements**: Huy chương và chứng nhận
- **fundraising**: Hệ thống gây quỹ từ thiện
- **users**: Quản lý người dùng và thành viên
- **integrations**: Tích hợp với ứng dụng bên thứ 3

---

## **6. Quy trình hoạt động**

### **6.1 Quy trình tạo và tham gia sự kiện**
1. **CLB tạo sự kiện**: Thiết lập mục tiêu, thời gian, điều kiện tham gia
2. **Thành viên đăng ký**: Đăng ký tham gia sự kiện
3. **Đồng bộ hoạt động**: Hệ thống tự động đồng bộ từ Strava/Garmin
4. **Cập nhật tiến độ**: Tính toán và cập nhật tiến độ tham gia
5. **Bảng xếp hạng**: Hiển thị thứ tự và thành tích real-time
6. **Trao thưởng**: Tự động trao huy chương và chứng nhận khi hoàn thành

### **6.2 Quy trình gây quỹ từ thiện**
1. **Tạo sự kiện gây quỹ**: Thiết lập mục tiêu tiền và đơn vị nhận quỹ
2. **Đăng ký tham gia**: Runner đăng ký và đóng phí tham gia
3. **Theo dõi tiến độ**: Hiển thị tiến độ gây quỹ và số km đã chạy
4. **Cập nhật real-time**: Cập nhật số tiền gây quỹ theo hoạt động chạy bộ
5. **Hoàn thành**: Trao huy chương và báo cáo kết quả gây quỹ
6. **Giải ngân**: Chuyển tiền cho đơn vị nhận quỹ

---

## **7. Lợi ích của hệ thống**

### **7.1 Đối với Runner**
- **Kết nối cộng đồng**: Tham gia CLB và giao lưu với runner khác
- **Động lực tập luyện**: Tham gia challenge và sự kiện có mục tiêu
- **Ghi nhận thành tích**: Huy chương và chứng nhận online
- **Đóng góp xã hội**: Tham gia gây quỹ từ thiện thông qua chạy bộ

### **7.2 Đối với CLB**
- **Quản lý hiệu quả**: Hệ thống quản lý thành viên và hoạt động tự động
- **Tăng tương tác**: Tạo sự kiện và challenge thúc đẩy thành viên
- **Mở rộng cộng đồng**: Thu hút runner mới tham gia
- **Tạo danh tiếng**: Tổ chức sự kiện gây quỹ từ thiện

### **7.3 Đối với xã hội**
- **Lan tỏa văn hóa chạy bộ**: Khuyến khích mọi người tham gia thể thao
- **Gây quỹ từ thiện**: Kết hợp thể thao với hoạt động xã hội
- **Kết nối cộng đồng**: Tạo môi trường giao lưu và chia sẻ
- **Phát triển bền vững**: Xây dựng cộng đồng runner vững mạnh

---
