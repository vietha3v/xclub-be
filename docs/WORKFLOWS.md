# Workflows - X-Club System

## Tổng quan
Tài liệu này mô tả các quy trình nghiệp vụ chính của hệ thống X-Club - ứng dụng quản lý câu lạc bộ chạy bộ với khả năng **đồng bộ dữ liệu tự động từ các nền tảng bên ngoài**. **Tất cả hoạt động chạy bộ đều được import tự động từ Strava, Garmin, Apple Health, Google Fit để đảm bảo tính chính xác và không thể giả mạo.**

## 1. Quy trình đăng ký và xác thực người dùng

### 1.1 Đăng ký tài khoản
1. **Người dùng truy cập** trang đăng ký
2. **Nhập thông tin cơ bản**: email, username, mật khẩu
3. **Xác thực email** qua link được gửi
4. **Hoàn tất hồ sơ cá nhân**: tên, số điện thoại, avatar
5. **Chọn câu lạc bộ** muốn tham gia (nếu có)
6. **Kích hoạt tài khoản** và bắt đầu sử dụng

### 1.2 Đăng nhập và xác thực
1. **Nhập thông tin đăng nhập**: email/username + mật khẩu
2. **Xác thực thông tin** với database
3. **Tạo JWT token** cho phiên làm việc
4. **Lưu thông tin người dùng** vào session
5. **Chuyển hướng** đến dashboard chính

### 1.3 Quản lý phiên làm việc
1. **Kiểm tra JWT token** mỗi request
2. **Xác thực quyền truy cập** theo vai trò
3. **Gia hạn token** nếu cần thiết
4. **Đăng xuất** và xóa token khi kết thúc

## 2. Quy trình tích hợp và đồng bộ dữ liệu (CORE WORKFLOW)

### 2.1 Kết nối tài khoản nền tảng bên ngoài
1. **Người dùng chọn nền tảng** muốn kết nối (Strava, Garmin, Apple Health, Google Fit)
2. **Chuyển hướng đến OAuth** của nền tảng tương ứng
3. **Xác thực và cấp quyền** truy cập dữ liệu
4. **Nhận access token** và refresh token
5. **Lưu thông tin xác thực** vào bảng `user_integrations`
6. **Thiết lập webhook** để nhận dữ liệu real-time (nếu có)
7. **Bắt đầu đồng bộ dữ liệu** lần đầu

### 2.2 Đồng bộ dữ liệu tự động
1. **Kiểm tra lịch trình đồng bộ** (hàng giờ, hàng ngày)
2. **Lấy danh sách hoạt động** từ nền tảng bên ngoài
3. **Kiểm tra trùng lặp** qua `externalId` và `sourceActivityId`
4. **Import dữ liệu GPS** và metrics vào hệ thống
5. **Tính toán các chỉ số** bổ sung (pace, speed, elevation)
6. **Cập nhật trạng thái đồng bộ** và thời gian đồng bộ cuối
7. **Gửi thông báo** khi đồng bộ hoàn thành

### 2.3 Xử lý lỗi đồng bộ
1. **Phát hiện lỗi** trong quá trình đồng bộ
2. **Ghi log lỗi chi tiết** vào `lastError` và `lastErrorAt`
3. **Thử lại theo retry policy** (3 lần, mỗi lần cách 5 phút)
4. **Gửi thông báo lỗi** cho admin và người dùng
5. **Cập nhật trạng thái** tích hợp thành `ERROR`

### 2.4 Quản lý token và gia hạn
1. **Kiểm tra thời hạn** access token
2. **Sử dụng refresh token** để lấy token mới
3. **Cập nhật thông tin** trong database
4. **Thông báo người dùng** nếu cần kết nối lại

## 3. Quy trình quản lý câu lạc bộ

### 3.1 Tạo câu lạc bộ mới
1. **Người dùng đăng ký** tạo câu lạc bộ
2. **Nhập thông tin cơ bản**: tên, mô tả, logo, banner
3. **Thiết lập cài đặt**: quyền riêng tư, quy tắc tham gia
4. **Chọn vị trí** và thông tin liên hệ
5. **Tạo mã câu lạc bộ** duy nhất
6. **Kích hoạt câu lạc bộ** và bắt đầu hoạt động

### 3.2 Quản lý thành viên
1. **Người dùng gửi yêu cầu** tham gia câu lạc bộ
2. **Admin xem xét** và phê duyệt/từ chối
3. **Gán vai trò** cho thành viên mới
4. **Gửi thông báo** xác nhận tham gia
5. **Cập nhật danh sách** thành viên

### 3.3 Quản lý vai trò và quyền hạn
1. **Admin tạo vai trò** mới cho câu lạc bộ
2. **Phân quyền** cho từng vai trò
3. **Gán vai trò** cho thành viên
4. **Kiểm tra quyền** khi thực hiện hành động
5. **Cập nhật quyền** khi cần thiết

## 4. Quy trình tổ chức sự kiện

### 4.1 Tạo sự kiện mới
1. **Admin/Moderator tạo** sự kiện mới
2. **Nhập thông tin**: tên, mô tả, thời gian, địa điểm
3. **Thiết lập quy tắc** tham gia và yêu cầu
4. **Tạo form đăng ký** với các trường cần thiết
5. **Thiết lập giới hạn** số lượng người tham gia
6. **Xuất bản sự kiện** và gửi thông báo

### 4.2 Quản lý đăng ký tham gia
1. **Người dùng xem** thông tin sự kiện
2. **Điền form đăng ký** với thông tin cá nhân
3. **Xác nhận tham gia** và nhận mã đăng ký
4. **Admin xem xét** và phê duyệt đăng ký
5. **Gửi thông báo** xác nhận hoặc từ chối
6. **Cập nhật danh sách** người tham gia

### 4.3 Tổ chức sự kiện
1. **Kiểm tra danh sách** người tham gia
2. **Gửi nhắc nhở** trước sự kiện
3. **Thực hiện check-in** tại sự kiện
4. **Ghi nhận kết quả** và thành tích
5. **Cập nhật hồ sơ** người tham gia
6. **Gửi thông báo** kết quả và cảm ơn

## 5. Quy trình tổ chức giải chạy

### 5.1 Tạo giải chạy mới
1. **Admin tạo giải chạy** với thông tin chi tiết
2. **Thiết lập các cự ly** và hạng mục thi đấu
3. **Tạo form đăng ký** với phí tham gia
4. **Thiết lập hệ thống** checkpoint và timing
5. **Xuất bản giải chạy** và mở đăng ký

### 5.2 Quản lý đăng ký giải chạy
1. **Người dùng xem** thông tin giải chạy
2. **Chọn cự ly** và hạng mục tham gia
3. **Thanh toán phí** tham gia
4. **Nhận mã số** và thông tin tham gia
5. **Cập nhật danh sách** người tham gia

### 5.3 Thực hiện giải chạy
1. **Check-in** người tham gia
2. **Phát thiết bị** timing và số báo danh
3. **Thực hiện giải chạy** theo lịch trình
4. **Ghi nhận kết quả** tại các checkpoint
5. **Tính toán thời gian** và xếp hạng
6. **Trao giải** cho người thắng cuộc

## 6. Quy trình tính toán thành tích và gamification

### 6.1 Tính toán thành tích cá nhân
1. **Thu thập dữ liệu** từ các hoạt động đã đồng bộ
2. **Tính toán các chỉ số**: tổng km, thời gian, tốc độ trung bình
3. **So sánh với mục tiêu** đã thiết lập
4. **Cập nhật hồ sơ** thành tích cá nhân
5. **Gửi thông báo** khi đạt mục tiêu

### 6.2 Hệ thống huy chương và thành tích
1. **Kiểm tra điều kiện** đạt được huy chương
2. **Tự động trao huy chương** khi đủ điều kiện
3. **Cập nhật hồ sơ** người dùng
4. **Gửi thông báo** chúc mừng
5. **Hiển thị trên profile** và leaderboard

### 6.3 Xếp hạng và leaderboard
1. **Thu thập dữ liệu** từ tất cả người dùng
2. **Tính toán điểm số** theo thuật toán xếp hạng
3. **Cập nhật bảng xếp hạng** theo thời gian thực
4. **Hiển thị top người dùng** trên dashboard
5. **Gửi thông báo** khi thay đổi vị trí

## 7. Quy trình thanh toán và phí dịch vụ

### 7.1 Thanh toán phí câu lạc bộ
1. **Hệ thống tạo hóa đơn** phí thành viên
2. **Gửi thông báo** yêu cầu thanh toán
3. **Người dùng chọn** phương thức thanh toán
4. **Thực hiện thanh toán** qua cổng thanh toán
5. **Xác nhận giao dịch** và cập nhật trạng thái
6. **Gia hạn quyền** thành viên

### 7.2 Thanh toán phí giải chạy
1. **Người dùng chọn** giải chạy và cự ly
2. **Hệ thống tính toán** phí tham gia
3. **Chọn phương thức** thanh toán
4. **Thực hiện thanh toán** và xác nhận
5. **Tạo mã đăng ký** và gửi xác nhận
6. **Cập nhật trạng thái** đăng ký

### 7.3 Xử lý hoàn tiền và chuyển nhượng
1. **Người dùng yêu cầu** hoàn tiền/chuyển nhượng
2. **Admin xem xét** yêu cầu theo quy định
3. **Phê duyệt hoặc từ chối** yêu cầu
4. **Thực hiện hoàn tiền** nếu được phê duyệt
5. **Cập nhật trạng thái** và gửi thông báo

## 8. Quy trình thông báo và tương tác

### 8.1 Hệ thống thông báo
1. **Hệ thống tạo thông báo** theo sự kiện
2. **Phân loại thông báo** theo loại và mức độ ưu tiên
3. **Gửi thông báo** qua các kênh (in-app, email, push)
4. **Ghi nhận trạng thái** đã đọc/chưa đọc
5. **Cập nhật số lượng** thông báo mới

### 8.2 Tương tác xã hội
1. **Người dùng chia sẻ** hoạt động và thành tích
2. **Hệ thống kiểm duyệt** nội dung chia sẻ
3. **Hiển thị trên feed** của bạn bè và câu lạc bộ
4. **Xử lý tương tác**: like, comment, share
5. **Gửi thông báo** cho người được tương tác

### 8.3 Quản lý nội dung
1. **Hệ thống kiểm duyệt** nội dung tự động
2. **Admin xem xét** nội dung được báo cáo
3. **Quyết định**: giữ nguyên, chỉnh sửa, xóa
4. **Thông báo kết quả** cho người báo cáo
5. **Cập nhật trạng thái** nội dung

## 9. Quy trình phân tích dữ liệu

### 9.1 Thu thập dữ liệu
1. **Hệ thống thu thập** dữ liệu từ các module
2. **Làm sạch dữ liệu** và kiểm tra tính hợp lệ
3. **Lưu trữ dữ liệu** vào data warehouse
4. **Cập nhật theo thời gian** thực hoặc theo lịch trình

### 9.2 Phân tích và báo cáo
1. **Tính toán các chỉ số** KPI chính
2. **Tạo báo cáo** theo thời gian (ngày, tuần, tháng, năm)
3. **Phân tích xu hướng** và so sánh
4. **Tạo dashboard** cho admin và người dùng
5. **Gửi báo cáo** định kỳ qua email

### 9.3 Tối ưu hóa hệ thống
1. **Phân tích hiệu suất** của các tính năng
2. **Xác định điểm nghẽn** và vấn đề
3. **Đề xuất cải tiến** và tối ưu hóa
4. **Thực hiện thay đổi** và đo lường kết quả
5. **Cập nhật tài liệu** và quy trình

## 10. Quy trình bảo mật và quyền riêng tư

### 10.1 Bảo mật dữ liệu
1. **Mã hóa dữ liệu** nhạy cảm
2. **Kiểm tra quyền truy cập** mỗi request
3. **Ghi log** tất cả hoạt động quan trọng
4. **Phát hiện hoạt động** bất thường
5. **Thực hiện biện pháp** bảo vệ khi cần

### 10.2 Quản lý quyền riêng tư
1. **Người dùng thiết lập** mức độ riêng tư
2. **Hệ thống áp dụng** cài đặt riêng tư
3. **Kiểm tra quyền** trước khi hiển thị thông tin
4. **Cho phép người dùng** kiểm soát dữ liệu cá nhân
5. **Tuân thủ quy định** GDPR và địa phương

### 10.3 Xử lý sự cố bảo mật
1. **Phát hiện sự cố** bảo mật
2. **Đánh giá mức độ** nghiêm trọng
3. **Thực hiện biện pháp** khắc phục ngay lập tức
4. **Thông báo cho** người dùng và cơ quan liên quan
5. **Điều tra nguyên nhân** và ngăn chặn tái diễn

## 11. Quy trình backup và khôi phục

### 11.1 Backup dữ liệu
1. **Lập lịch backup** tự động theo thời gian
2. **Backup database** và file media
3. **Kiểm tra tính toàn vẹn** của backup
4. **Lưu trữ backup** ở nhiều vị trí
5. **Ghi log** quá trình backup

### 11.2 Khôi phục dữ liệu
1. **Xác định phiên bản** cần khôi phục
2. **Kiểm tra tính khả dụng** của backup
3. **Thực hiện khôi phục** theo quy trình
4. **Kiểm tra tính toàn vẹn** sau khôi phục
5. **Thông báo kết quả** cho admin

## 12. Quy trình cập nhật và bảo trì

### 12.1 Cập nhật hệ thống
1. **Lập kế hoạch** cập nhật
2. **Thông báo trước** cho người dùng
3. **Thực hiện cập nhật** trong thời gian ít người dùng
4. **Kiểm tra hoạt động** sau cập nhật
5. **Khôi phục** nếu có vấn đề

### 12.2 Bảo trì định kỳ
1. **Lập lịch bảo trì** theo thời gian
2. **Thực hiện bảo trì** database và hệ thống
3. **Tối ưu hóa hiệu suất** và dọn dẹp dữ liệu
4. **Kiểm tra bảo mật** và cập nhật patch
5. **Ghi log** quá trình bảo trì

## Kết luận

Các quy trình nghiệp vụ này đảm bảo hệ thống X-Club hoạt động ổn định, hiệu quả và đáp ứng nhu cầu của người dùng. **Đặc biệt quan trọng là quy trình tích hợp và đồng bộ dữ liệu tự động, giúp đảm bảo tính chính xác và đáng tin cậy của dữ liệu hoạt động chạy bộ.**

**Lưu ý quan trọng**: Tất cả hoạt động chạy bộ phải được đồng bộ tự động từ các nền tảng bên ngoài, không cho phép tạo/sửa thủ công để đảm bảo tính toàn vẹn và chính xác của dữ liệu.
