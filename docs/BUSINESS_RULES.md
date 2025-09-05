# Business Rules - X-Club System

## Tổng quan
Tài liệu này mô tả các quy tắc nghiệp vụ cốt lõi của hệ thống X-Club - ứng dụng quản lý câu lạc bộ chạy bộ với khả năng **đồng bộ dữ liệu tự động từ các nền tảng bên ngoài**. **Tất cả hoạt động chạy bộ đều được import tự động từ Strava, Garmin, Apple Health, Google Fit để đảm bảo tính chính xác và không thể giả mạo.**

## 1. Quản lý người dùng (User Management)

### 1.1 Đăng ký và xác thực
- Người dùng có thể đăng ký bằng email hoặc tài khoản mạng xã hội
- Username phải duy nhất trong hệ thống
- Email phải được xác thực trước khi sử dụng
- Mật khẩu phải đáp ứng yêu cầu bảo mật tối thiểu

### 1.2 Hồ sơ người dùng
- Thông tin cá nhân cơ bản: tên, email, số điện thoại
- Avatar và thông tin cá nhân có thể công khai hoặc riêng tư
- Người dùng có thể thiết lập mức độ hiển thị thông tin

### 1.3 Vai trò và quyền hạn
- Vai trò mặc định: 'runner' (người chạy bộ)
- Có thể có nhiều vai trò: runner, club_admin, event_organizer
- Quyền hạn được phân theo vai trò và câu lạc bộ

## 2. Quản lý hoạt động chạy bộ (Activity Management)

### 2.1 Nguyên tắc cốt lõi
- **KHÔNG cho phép người dùng tạo activity thủ công** - vì hệ thống không thể xác thực người dùng có thực sự chạy hay không
- **Chỉ có Strava/Garmin mới có thể xác thực** qua dữ liệu đồng hồ thông minh
- **100% activity phải có nguồn gốc rõ ràng** từ nền tảng bên ngoài
- **Không có API tạo/sửa/xóa activity** - để đảm bảo tính toàn vẹn dữ liệu

### 2.2 Đồng bộ dữ liệu tự động
- **Tích hợp với Strava**: Đồng bộ hoạt động chạy bộ qua OAuth
- **Tích hợp với Garmin**: Đồng bộ dữ liệu từ thiết bị Garmin Connect
- **Tích hợp với Apple Health**: Đồng bộ dữ liệu sức khỏe từ iOS
- **Tích hợp với Google Fit**: Đồng bộ dữ liệu từ Android
- Dữ liệu được đồng bộ tự động theo lịch trình hoặc qua webhook
- Lưu trữ metadata gốc từ nền tảng bên ngoài

### 2.3 Quyền riêng tư
- Hoạt động mặc định là riêng tư
- Có thể chia sẻ với bạn bè, câu lạc bộ hoặc công khai
- Người dùng kiểm soát hoàn toàn quyền hiển thị

### 2.4 Quyền truy cập activity
- **Người dùng chỉ có quyền xem** activity của mình
- **Admin chỉ có quyền xem** tất cả activity
- **Không có quyền tạo/sửa/xóa** activity thủ công
- **Chỉ có quyền quản lý cài đặt tích hợp** và đồng bộ

## 3. Quản lý câu lạc bộ (Club Management)

### 3.1 Tạo câu lạc bộ
- Mỗi câu lạc bộ có mã duy nhất
- Thông tin cơ bản: tên, mô tả, logo, banner
- Vị trí và thông tin liên hệ
- Cài đặt riêng cho từng câu lạc bộ

### 3.2 Thành viên câu lạc bộ
- Vai trò: member, admin, moderator
- Quyền hạn khác nhau theo vai trò
- Quy trình tham gia và rời khỏi câu lạc bộ
- Quản lý trạng thái thành viên

### 3.3 Hoạt động câu lạc bộ
- Tổ chức sự kiện và hoạt động
- Quản lý thử thách và thách đấu
- Thống kê hoạt động của thành viên (từ dữ liệu đồng bộ)

## 4. Sự kiện và giải chạy (Events & Races)

### 4.1 Sự kiện câu lạc bộ
- Các loại: training, competition, social
- Quản lý đăng ký tham gia
- Giới hạn số lượng người tham gia
- Quy tắc và yêu cầu tham gia

### 4.2 Giải chạy
- Hỗ trợ nhiều cự ly: 5K, 10K, half marathon, marathon
- Quản lý đăng ký và phí tham gia
- Hệ thống checkpoint và timing
- Xếp hạng và trao giải

### 4.3 Quản lý tham gia
- Đăng ký tham gia với xác nhận
- Cho phép rút lui theo quy định
- Quản lý danh sách người tham gia
- Thống kê và báo cáo

## 5. Thành tích và gamification (Achievement & Gamification)

### 5.1 Hệ thống huy chương
- Các cấp độ: bronze, silver, gold, platinum, diamond
- Điều kiện đạt được dựa trên hoạt động (từ dữ liệu đồng bộ)
- Huy chương có thể được chia sẻ công khai

### 5.2 Thành tích cá nhân
- Theo dõi tiến độ và mục tiêu (dựa trên dữ liệu thực tế)
- So sánh với các thành tích trước đó
- Thống kê tổng hợp theo thời gian

### 5.3 Xếp hạng và leaderboard
- Xếp hạng theo câu lạc bộ
- Xếp hạng theo sự kiện/giải chạy
- Cập nhật real-time dựa trên dữ liệu đồng bộ

## 6. Tích hợp nền tảng bên ngoài (External Platform Integration)

### 6.1 Nguyên tắc tích hợp
- **Chỉ tin tưởng dữ liệu** từ các nền tảng thể thao uy tín
- **Không cho phép tạo/sửa thủ công** để đảm bảo tính chính xác
- **Tự động đồng bộ** từ Strava, Garmin, Apple Health, Google Fit
- **Dễ dàng mở rộng** và bảo trì trong tương lai

### 6.2 Strava Integration
- Kết nối tài khoản Strava qua OAuth 2.0
- Đồng bộ hoạt động chạy bộ tự động
- Import dữ liệu GPS và thống kê
- Webhook để nhận dữ liệu real-time

### 6.3 Garmin Integration
- Kết nối thiết bị Garmin qua OAuth
- Đồng bộ dữ liệu nhịp tim và GPS
- Hỗ trợ nhiều loại thiết bị Garmin
- Đồng bộ theo lịch trình

### 6.4 Apple Health & Google Fit
- Đồng bộ dữ liệu sức khỏe từ mobile
- Import hoạt động workout và metrics
- Tích hợp với hệ sinh thái iOS/Android

## 7. Thông báo và tương tác (Notification & Social)

### 7.1 Hệ thống thông báo
- Thông báo trong ứng dụng
- Email và push notification
- Tùy chỉnh cài đặt thông báo
- Thông báo khi đồng bộ hoàn thành

### 7.2 Tương tác xã hội
- Chia sẻ hoạt động và thành tích (từ dữ liệu đồng bộ)
- Like, comment, share
- Hashtag và mention
- Feed hoạt động cá nhân và câu lạc bộ

### 7.3 Quản lý nội dung
- Kiểm duyệt nội dung chia sẻ
- Báo cáo nội dung không phù hợp
- Quy tắc cộng đồng

## 8. Thanh toán và phí dịch vụ (Payment & Fees)

### 8.1 Phí câu lạc bộ
- Phí thành viên hàng tháng/năm
- Phí tham gia sự kiện đặc biệt
- Hỗ trợ nhiều phương thức thanh toán

### 8.2 Phí giải chạy
- Phí đăng ký tham gia
- Phí VIP và dịch vụ bổ sung
- Hoàn tiền và chuyển nhượng

### 8.3 Cổng thanh toán
- VNPay, Momo, ZaloPay
- Thanh toán quốc tế (nếu cần)
- Bảo mật thông tin thanh toán

## 9. Phân tích dữ liệu (Data Analytics)

### 9.1 Thống kê cá nhân
- Tiến độ tập luyện (dựa trên dữ liệu thực tế)
- So sánh hiệu suất
- Phân tích xu hướng

### 9.2 Thống kê câu lạc bộ
- Hoạt động của thành viên (từ dữ liệu đồng bộ)
- Hiệu quả sự kiện
- Báo cáo tổng hợp

### 9.3 Báo cáo hệ thống
- Sử dụng ứng dụng
- Hiệu suất đồng bộ dữ liệu
- Thống kê người dùng

## 10. Bảo mật và quyền riêng tư (Security & Privacy)

### 10.1 Bảo mật dữ liệu
- Mã hóa dữ liệu nhạy cảm
- Xác thực hai yếu tố
- Kiểm soát truy cập

### 10.2 Quyền riêng tư
- Kiểm soát thông tin chia sẻ
- Xóa dữ liệu theo yêu cầu
- Tuân thủ GDPR và quy định địa phương

### 10.3 Bảo vệ tài khoản
- Phát hiện hoạt động bất thường
- Khóa tài khoản tự động
- Khôi phục tài khoản

## 11. Quy tắc chung (General Rules)

### 11.1 Sử dụng hệ thống
- Tuân thủ quy tắc cộng đồng
- Không sử dụng sai mục đích
- Báo cáo lỗi và góp ý

### 11.2 Cập nhật và bảo trì
- Thông báo trước khi bảo trì
- Backup dữ liệu định kỳ
- Cập nhật tính năng mới

### 11.3 Hỗ trợ người dùng
- Hướng dẫn sử dụng
- Hỗ trợ kỹ thuật
- Giải đáp thắc mắc

## 12. Quy tắc đặc biệt cho hoạt động chạy bộ

### 12.1 Nguyên tắc "Trust but Verify"
- **Chỉ tin tưởng dữ liệu** từ các nền tảng thể thao uy tín
- **Không cho phép tạo/sửa thủ công** để đảm bảo tính chính xác
- **Tự động đồng bộ** từ Strava, Garmin, Apple Health, Google Fit
- **Dễ dàng mở rộng** và bảo trì trong tương lai

### 12.2 Quy trình đồng bộ dữ liệu
1. **Người dùng kết nối tài khoản** với nền tảng bên ngoài qua OAuth
2. **Hệ thống lưu thông tin xác thực** vào bảng `user_integrations`
3. **Thiết lập webhook** để nhận dữ liệu real-time (nếu có)
4. **Bắt đầu đồng bộ dữ liệu** theo lịch trình hoặc theo yêu cầu
5. **Kiểm tra trùng lặp** qua `externalId` và `sourceActivityId`
6. **Import dữ liệu GPS** và metrics vào hệ thống
7. **Tính toán các chỉ số** bổ sung (pace, speed, elevation)
8. **Cập nhật trạng thái đồng bộ** và thời gian đồng bộ cuối

### 12.3 Xử lý lỗi đồng bộ
1. **Phát hiện lỗi** trong quá trình đồng bộ
2. **Ghi log lỗi chi tiết** vào `lastError` và `lastErrorAt`
3. **Thử lại theo retry policy** (3 lần, mỗi lần cách 5 phút)
4. **Gửi thông báo lỗi** cho admin và người dùng
5. **Cập nhật trạng thái** tích hợp thành `ERROR`

## Kết luận

Các quy tắc nghiệp vụ này đảm bảo hệ thống X-Club hoạt động ổn định, bảo mật và đáp ứng nhu cầu của người dùng chạy bộ. **Việc tuân thủ nguyên tắc "Trust but Verify" giúp xây dựng hệ thống có dữ liệu hoạt động chạy bộ chính xác, đáng tin cậy và không thể giả mạo.**

**Đặc biệt quan trọng**: Tất cả hoạt động chạy bộ phải được đồng bộ tự động từ các nền tảng bên ngoài, không cho phép tạo/sửa thủ công để đảm bảo tính toàn vẹn và chính xác của dữ liệu.
