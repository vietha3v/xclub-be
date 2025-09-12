# 📚 Tài liệu X-Club System

## 🎯 Tổng quan
X-Club là hệ thống quản lý câu lạc bộ chạy bộ với khả năng **đồng bộ dữ liệu tự động từ các nền tảng bên ngoài** như Strava, Garmin, Apple Health, Google Fit. **Tất cả hoạt động chạy bộ đều được import tự động từ các nền tảng này để đảm bảo tính chính xác và không thể giả mạo.**

### 📖 Tài liệu tổng quan
- [**PROJECT_OVERVIEW.md**](./PROJECT_OVERVIEW.md) - Tài liệu tổng quan dự án X-Club

## 🏗️ Kiến trúc hệ thống

### 📋 Tài liệu cơ bản
- [**DATABASE_SCHEMA.md**](./DATABASE_SCHEMA.md) - Cấu trúc cơ sở dữ liệu
- [**BUSINESS_RULES.md**](./BUSINESS_RULES.md) - Quy tắc nghiệp vụ
- [**WORKFLOWS.md**](./WORKFLOWS.md) - Quy trình nghiệp vụ
- [**CALCULATIONS.md**](./CALCULATIONS.md) - Công thức tính toán
- [**INTEGRATIONS.md**](./INTEGRATIONS.md) - Tích hợp nền tảng bên ngoài

## 🚀 Các module chính

### 🔐 Bảo mật & Tài khoản
- [**User Module**](./User.md) - Quản lý người dùng
- [**Auth Module**](./Auth.md) - Xác thực và phân quyền

### 🏃‍♂️ Hoạt động chạy bộ (ĐỒNG BỘ TỰ ĐỘNG)
- [**Activity Module**](./Activity.md) - **Lưu trữ hoạt động chạy (đồng bộ tự động từ Strava/Garmin) - KHÔNG cho phép tạo thủ công**
- [**Integration Module**](./Integration.md) - **Quản lý kết nối OAuth 2.0 và đồng bộ dữ liệu với nền tảng bên thứ 3**
- [**Club Module**](./Club.md) - Tạo và quản lý câu lạc bộ chạy bộ
- [**Event Module**](./Event.md) - Sự kiện chạy bộ của câu lạc bộ
- [**Race Module**](./Race.md) - Giải chạy chính thức
- [**Challenge Module**](./Challenge.md) - Thử thách và thi đấu
- [**Challenge Category Module**](./ChallengeCategory.md) - Danh mục thử thách (5K, 10K, Marathon, etc.)
- [**Achievement Module**](./Achievement.md) - Huy chương, thành tích, gamification

### 🏅 Template Designer
- [**Medal Template Module**](./MedalTemplate.md) - Thiết kế mẫu huy chương với HTML/CSS
- [**GiayChungNhan Template Module**](./GiayChungNhanTemplate.md) - Thiết kế mẫu giấy chứng nhận với HTML/CSS

### 🔗 Tích hợp & Dịch vụ
- [**Integration Module**](./INTEGRATIONS.md) - **Tích hợp và đồng bộ dữ liệu từ nền tảng bên ngoài**
- [**Notification Module**](./Notification.md) - Thông báo cho người dùng
- [**Payment Module**](./Payment.md) - Thanh toán phí câu lạc bộ, giải chạy

### 📊 Phân tích & Tương tác
- [**Analytics Module**](./Analytics.md) - Phân tích dữ liệu và dashboard
- [**Social Module**](./Social.md) - Tương tác xã hội, bài viết, comment, like
- [**Media Module**](./Media.md) - Quản lý file, hình ảnh, video


## 🎯 Mục tiêu hệ thống

### 🏃‍♂️ Ứng dụng chạy bộ
- **Đồng bộ tự động hoạt động chạy bộ** từ Strava, Garmin, Apple Health, Google Fit
- **Không cho phép tạo activity thủ công** - vì hệ thống không thể xác thực người dùng có thực sự chạy hay không
- **Chỉ có Strava/Garmin mới có thể xác thực** qua dữ liệu đồng hồ thông minh
- Quản lý câu lạc bộ chạy bộ
- Tổ chức sự kiện và giải chạy

### 🏆 Gamification
- Hệ thống huy chương và thành tích
- Xếp hạng và leaderboard
- Thử thách và mục tiêu

### 👥 Cộng đồng
- Tương tác xã hội giữa người chạy
- Chia sẻ hoạt động và thành tích
- Tạo câu lạc bộ và nhóm chạy

## 🔧 Công nghệ sử dụng

### 🖥️ Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, OAuth 2.0
- **API Documentation**: Swagger

### 📱 Frontend
- **Framework**: Next.js
- **Authentication**: NextAuth.js
- **UI Library**: daisyUI
- **Styling**: Tailwind CSS

### 🔗 Tích hợp
- **Strava API**: Đồng bộ hoạt động chạy bộ qua OAuth
- **Garmin API**: Đồng bộ dữ liệu từ thiết bị Garmin Connect
- **Apple Health**: Đồng bộ dữ liệu sức khỏe từ iOS
- **Google Fit**: Đồng bộ dữ liệu từ Android
- **Payment Gateways**: VNPay, Momo, ZaloPay

## 📈 Tính năng chính

### 🏃‍♂️ Hoạt động chạy bộ (ĐỒNG BỘ TỰ ĐỘNG)
- **Đồng bộ tự động hoạt động** từ Strava, Garmin, Apple Health, Google Fit
- **Không có API tạo/sửa/xóa activity thủ công** - để đảm bảo tính chính xác
- **100% activity phải có nguồn gốc rõ ràng** từ nền tảng bên ngoài
- Lưu trữ dữ liệu chi tiết (GPS, nhịp tim, tốc độ, độ cao)
- Phân tích hiệu suất và tiến độ

### 🏢 Quản lý câu lạc bộ
- Tạo và quản lý câu lạc bộ chạy bộ
- Quản lý thành viên và vai trò
- Tổ chức sự kiện và hoạt động

### 🏆 Sự kiện và giải chạy
- Tạo và quản lý sự kiện chạy bộ
- Tổ chức giải chạy với nhiều cự ly
- Đăng ký tham gia và quản lý người tham gia

### 🎯 Thành tích và gamification
- Hệ thống huy chương và thành tích
- Xếp hạng và leaderboard
- Thử thách và mục tiêu cá nhân

### 🔗 Tích hợp nền tảng bên ngoài
- **OAuth 2.0** để kết nối tài khoản
- **Webhook** để nhận dữ liệu real-time
- **Đồng bộ theo lịch trình** hoặc theo yêu cầu
- **Import/export dữ liệu hoạt động** tự động
