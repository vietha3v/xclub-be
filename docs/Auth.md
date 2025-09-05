# Auth Module - Xác thực và phân quyền

## **1. Tổng quan module**

### **1.1 Mục đích**
Module Auth quản lý việc xác thực người dùng và phân quyền truy cập trong hệ thống X-Club, đảm bảo tính bảo mật và kiểm soát quyền truy cập vào các chức năng khác nhau.

### **1.2 Phạm vi**
- **Xác thực người dùng**: Đăng nhập, đăng ký, quản lý phiên đăng nhập
- **Phân quyền truy cập**: Kiểm soát quyền truy cập vào các chức năng
- **Bảo mật**: Mã hóa mật khẩu, JWT token, OAuth
- **Không quản lý**: Nội dung người dùng, hoạt động chạy bộ

---

## **2. Chức năng chính của hệ thống**

### **2.1 Xác thực người dùng**
- **Đăng ký tài khoản**: Tạo tài khoản mới với email và mật khẩu
- **Đăng nhập**: Xác thực thông tin đăng nhập
- **Đăng xuất**: Kết thúc phiên đăng nhập
- **Quên mật khẩu**: Khôi phục mật khẩu qua email
- **Xác thực email**: Xác thực tài khoản qua email

### **2.2 Phân quyền truy cập**
- **Role-based access control**: Phân quyền theo vai trò
- **Permission-based access**: Phân quyền theo chức năng cụ thể
- **Club-based access**: Phân quyền theo CLB thành viên
- **Resource-based access**: Phân quyền theo tài nguyên cụ thể

### **2.3 Bảo mật**
- **Mã hóa mật khẩu**: Sử dụng bcrypt để mã hóa mật khẩu
- **JWT token**: Sử dụng JWT để quản lý phiên đăng nhập
- **OAuth 2.0**: Hỗ trợ đăng nhập qua Google, Facebook
- **Rate limiting**: Giới hạn số lần đăng nhập để tránh brute force

### **2.4 Quản lý phiên đăng nhập**
- **Session management**: Quản lý phiên đăng nhập
- **Token refresh**: Tự động làm mới token khi cần thiết
- **Multi-device login**: Hỗ trợ đăng nhập trên nhiều thiết bị
- **Force logout**: Buộc đăng xuất từ xa khi cần thiết

---

## **3. Quy trình hoạt động**

### **3.1 Quy trình đăng ký**
1. **Người dùng nhập thông tin**: Email, mật khẩu, thông tin cá nhân
2. **Kiểm tra thông tin**: Validate email, mật khẩu mạnh
3. **Kiểm tra trùng lặp**: Kiểm tra email đã tồn tại chưa
4. **Mã hóa mật khẩu**: Mã hóa mật khẩu bằng bcrypt
5. **Tạo tài khoản**: Lưu thông tin vào database
6. **Gửi email xác thực**: Gửi email để xác thực tài khoản
7. **Kích hoạt tài khoản**: Tài khoản được kích hoạt sau khi xác thực

### **3.2 Quy trình đăng nhập**
1. **Người dùng nhập thông tin**: Email và mật khẩu
2. **Kiểm tra tài khoản**: Tìm tài khoản trong database
3. **Xác thực mật khẩu**: So sánh mật khẩu đã mã hóa
4. **Kiểm tra trạng thái**: Kiểm tra tài khoản có bị khóa không
5. **Tạo JWT token**: Tạo token xác thực
6. **Lưu thông tin phiên**: Lưu thông tin phiên đăng nhập
7. **Trả về token**: Trả về token cho người dùng

### **3.3 Quy trình phân quyền**
1. **Người dùng gửi request**: Gửi request đến API
2. **Kiểm tra token**: Xác thực JWT token
3. **Lấy thông tin người dùng**: Lấy thông tin từ token
4. **Kiểm tra quyền**: Kiểm tra quyền truy cập vào chức năng
5. **Cho phép/từ chối**: Cho phép hoặc từ chối request
6. **Ghi log**: Ghi lại lịch sử truy cập

---

## **4. Lợi ích của hệ thống**

### **4.1 Đối với người dùng**
- **Bảo mật tài khoản**: Tài khoản được bảo vệ an toàn
- **Đăng nhập dễ dàng**: Nhiều phương thức đăng nhập linh hoạt
- **Quyền riêng tư**: Kiểm soát quyền truy cập thông tin cá nhân
- **Đa thiết bị**: Đăng nhập trên nhiều thiết bị khác nhau

### **4.2 Đối với CLB**
- **Quản lý thành viên**: Kiểm soát quyền truy cập của thành viên
- **Bảo mật thông tin**: Bảo vệ thông tin nội bộ của CLB
- **Phân quyền rõ ràng**: Admin, moderator, member có quyền khác nhau
- **Kiểm soát hoạt động**: Theo dõi hoạt động của thành viên

### **4.3 Đối với hệ thống**
- **Bảo mật cao**: Hệ thống được bảo vệ khỏi truy cập trái phép
- **Kiểm soát quyền**: Kiểm soát chặt chẽ quyền truy cập
- **Audit trail**: Ghi lại lịch sử truy cập để kiểm tra
- **Tuân thủ quy định**: Tuân thủ các quy định về bảo mật

---

## **5. Ví dụ thực tế**

### **5.1 Đăng ký tài khoản mới**
- **Thông tin**: Email: user@example.com, mật khẩu: StrongPass123!
- **Quy trình**: Nhập thông tin → Validate → Mã hóa mật khẩu → Tạo tài khoản → Gửi email xác thực
- **Kết quả**: Tài khoản được tạo, chờ xác thực email

### **5.2 Đăng nhập vào hệ thống**
- **Thông tin**: Email: user@example.com, mật khẩu: StrongPass123!
- **Quy trình**: Nhập thông tin → Xác thực → Tạo JWT token → Trả về token
- **Kết quả**: Đăng nhập thành công, nhận được JWT token

### **5.3 Phân quyền truy cập**
- **Người dùng**: Thành viên CLB "Hà Nội Runners"
- **Vai trò**: Member
- **Quyền**: Xem thông tin CLB, tham gia sự kiện, xem thành viên khác
- **Hạn chế**: Không thể quản lý CLB, không thể xóa thành viên

### **5.4 OAuth đăng nhập**
- **Phương thức**: Đăng nhập qua Google
- **Quy trình**: Chọn Google → Chuyển đến Google → Xác thực → Nhận thông tin → Tạo/cập nhật tài khoản
- **Kết quả**: Đăng nhập thành công với tài khoản Google

---

## **6. Tương tác với các module khác**

### **6.1 Module User**
- **Thông tin người dùng**: Lấy thông tin từ database
- **Cập nhật thông tin**: Cập nhật thông tin đăng nhập
- **Quản lý tài khoản**: Kích hoạt, khóa, xóa tài khoản

### **6.2 Module Club**
- **Phân quyền CLB**: Kiểm tra quyền trong CLB
- **Quản lý thành viên**: Kiểm tra quyền quản lý thành viên
- **Truy cập thông tin**: Kiểm tra quyền xem thông tin CLB

### **6.3 Module Event**
- **Quyền tham gia**: Kiểm tra quyền tham gia sự kiện
- **Quyền quản lý**: Kiểm tra quyền quản lý sự kiện
- **Quyền xem**: Kiểm tra quyền xem thông tin sự kiện

### **6.4 Module Activity**
- **Quyền xem**: Kiểm tra quyền xem hoạt động của người khác
- **Quyền chia sẻ**: Kiểm tra quyền chia sẻ hoạt động
- **Quyền xóa**: Kiểm tra quyền xóa hoạt động

---

**Tài liệu này mô tả chức năng của Auth Module trong hệ thống X-Club, tập trung vào việc xác thực người dùng và phân quyền truy cập để đảm bảo tính bảo mật và kiểm soát quyền truy cập trong hệ thống.**
