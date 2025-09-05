# User Module - Quản lý người dùng

## **1. Tổng quan module**

### **1.1 Mục đích**
Module User quản lý **thông tin cốt lõi** của người dùng trong hệ thống X-Club, bao gồm thông tin cá nhân, vai trò, trạng thái và các thiết lập cơ bản.

### **1.2 Phạm vi**
- **Quản lý thông tin người dùng**: Tạo, sửa, xóa, tìm kiếm thông tin cá nhân
- **Quản lý trạng thái**: Active, inactive, banned, deleted
- **Quản lý vai trò**: Phân quyền cơ bản trong hệ thống

---

## **2. Chức năng chính**

### **2.1 Quản lý người dùng**
- **Tạo người dùng mới**: Hỗ trợ đăng ký tài khoản với thông tin cơ bản
- **Cập nhật thông tin**: Cho phép người dùng cập nhật thông tin cá nhân
- **Xóa người dùng**: Thực hiện xóa mềm để bảo toàn dữ liệu
- **Tìm kiếm và lọc**: Hỗ trợ tìm kiếm theo tên và lọc theo nhiều tiêu chí

### **2.2 Quản lý trạng thái**
- **Trạng thái hoạt động**: Active, inactive, banned
- **Quyền cơ bản**: Quyền truy cập thông tin công khai
- **Quyền hệ thống**: Quyền admin để quản lý người dùng

### **2.3 Tìm kiếm và lọc**
- **Tìm kiếm theo tên**: Hỗ trợ tìm kiếm người dùng theo tên
- **Lọc theo trạng thái**: Lọc theo trạng thái hoạt động
- **Lọc theo trạng thái**: Lọc theo trạng thái hoạt động
- **Lọc theo kinh nghiệm**: Lọc theo mức độ kinh nghiệm chạy bộ
- **Phân trang kết quả**: Hỗ trợ phân trang để tối ưu hiệu suất

### **2.4 Thông tin cơ bản**
- **Tổng số người dùng**: Hiển thị số lượng người dùng trong hệ thống
- **Thông tin người dùng**: Xem thông tin cơ bản của người dùng
- **Quản lý trạng thái**: Theo dõi trạng thái hoạt động của người dùng

---

## **3. Thông tin người dùng**

### **3.1 Thông tin cơ bản**
- **Thông tin định danh**: ID, tên đăng nhập, email
- **Thông tin cá nhân**: Họ tên, số điện thoại, ngày sinh, giới tính
- **Thông tin thể chất**: Chiều cao, cân nặng
- **Thông tin liên hệ**: Địa chỉ, tọa độ, múi giờ

### **3.2 Thông tin chuyên môn**
- **Kinh nghiệm chạy bộ**: Beginner, Intermediate, Advanced, Expert
- **Thiết lập cá nhân**: Ngôn ngữ, đơn vị đo, tiền tệ
- **Hồ sơ công khai**: Cài đặt quyền riêng tư

### **3.3 Thông tin hệ thống**
- **Trạng thái**: Active, Inactive, Banned
- **Xác thực**: Trạng thái xác thực email
- **Hoạt động**: Thời gian đăng nhập và hoạt động cuối

---

## **4. Quy tắc nghiệp vụ**

### **4.1 Quy tắc tạo người dùng**
- **Tên đăng nhập phải duy nhất** trong hệ thống
- **Email phải duy nhất** và có định dạng hợp lệ
- **Mật khẩu phải đảm bảo an toàn** theo tiêu chuẩn bảo mật
- **Vai trò mặc định** là 'user' nếu không được chỉ định
- **Trạng thái mặc định** là 'active'

### **4.2 Quy tắc cập nhật**
- **Không thể thay đổi tên đăng nhập** sau khi đã tạo
- **Email có thể thay đổi** nhưng phải duy nhất
- **Mật khẩu chỉ được cập nhật** khi có yêu cầu rõ ràng
- **Vai trò chỉ có thể thay đổi** bởi admin

### **4.3 Quy tắc xóa**
- **Sử dụng xóa mềm** để bảo toàn dữ liệu
- **Ghi lại thông tin người xóa** và thời gian xóa
- **Không thể xóa hoàn toàn** dữ liệu người dùng

### **4.4 Quy tắc phân quyền**
- **Quyền quản lý người dùng**: Chỉ dành cho admin hệ thống
- **Quyền xem thông tin**: Người dùng có thể xem thông tin công khai của nhau
- **Quyền cập nhật**: Người dùng chỉ có thể cập nhật thông tin của mình

---

## **5. Quan hệ với các module khác**

### **5.1 Module Club**
- **Cung cấp thông tin người dùng**: Khi Club module cần thông tin user để hiển thị trong danh sách thành viên

### **5.2 Module Activity**
- **Cung cấp thông tin người dùng**: Khi Activity module cần hiển thị thông tin user trong danh sách hoạt động

### **5.3 Module Event & Challenge**
- **Cung cấp thông tin người dùng**: Khi Event/Challenge module cần hiển thị thông tin user trong danh sách người tham gia

### **5.4 Module Race**
- **Cung cấp thông tin người dùng**: Khi Race module cần hiển thị thông tin user trong danh sách đăng ký giải

### **5.5 Module Integration**
- **Cung cấp thông tin người dùng**: Khi Integration module cần lưu trữ thông tin user đã kết nối với Strava/Garmin

### **5.6 Module Achievement**
- **Cung cấp thông tin người dùng**: Khi Achievement module cần hiển thị thông tin user trong danh sách người đạt thành tích

---

## **6. Luồng xử lý chính**

### **6.1 Đăng ký tài khoản**
1. **Nhập thông tin**: Người dùng nhập thông tin cá nhân
2. **Kiểm tra trùng lặp**: Hệ thống kiểm tra tên đăng nhập và email
3. **Tạo tài khoản**: Hệ thống tạo tài khoản với vai trò mặc định
4. **Xác thực email**: Gửi email xác thực tài khoản

### **6.2 Cập nhật thông tin**
1. **Yêu cầu cập nhật**: Người dùng yêu cầu cập nhật thông tin
2. **Kiểm tra quyền**: Hệ thống kiểm tra quyền cập nhật
3. **Xác thực dữ liệu**: Kiểm tra tính hợp lệ của dữ liệu
4. **Cập nhật thành công**: Lưu thông tin mới vào hệ thống

### **6.3 Quản lý trạng thái**
1. **Trạng thái mặc định**: Tất cả người dùng đăng ký đều có trạng thái 'active'
2. **Quyền cơ bản**: Quyền truy cập thông tin công khai
3. **Quyền hệ thống**: Admin có thể thay đổi trạng thái người dùng
4. **Ghi log**: Theo dõi mọi thay đổi trạng thái

---

## **7. Thông tin cơ bản**

### **7.1 Thông tin tổng quan**
- **Tổng số người dùng**: Hiển thị số lượng người dùng trong hệ thống
- **Người dùng mới**: Số lượng đăng ký gần đây
- **Người dùng hoạt động**: Số người dùng có trạng thái active

### **7.2 Thông tin theo nhóm**
- **Phân bố kinh nghiệm**: Số lượng người dùng theo mức độ kinh nghiệm
- **Phân bố địa lý**: Số người dùng theo vùng miền, thành phố
- **Phân bố trạng thái**: Số người dùng theo trạng thái hoạt động

---

## **8. Yêu cầu cơ bản**

### **8.1 Bảo mật**
- **Mã hóa mật khẩu**: Sử dụng thuật toán mã hóa an toàn
- **Kiểm soát truy cập**: Phân quyền theo vai trò hệ thống
- **Ghi log hoạt động**: Theo dõi thay đổi thông tin người dùng

### **8.2 Khả năng sử dụng**
- **Giao diện đơn giản**: Dễ dàng tìm kiếm và quản lý người dùng
- **Phân trang kết quả**: Hiển thị danh sách người dùng theo trang
- **Tìm kiếm nhanh**: Hỗ trợ tìm kiếm theo tên và lọc theo tiêu chí
