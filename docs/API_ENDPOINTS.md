# API Endpoints - X-Club System

## User Management APIs

### User CRUD
- `GET /api/users` - Lấy danh sách user (admin only)
- `POST /api/users` - Tạo user mới (admin only)
- `GET /api/users/me` - Lấy thông tin user hiện tại ✅
- `PUT /api/users/me` - Cập nhật thông tin user hiện tại ✅
- `GET /api/users/:id` - Lấy thông tin user theo ID
- `PATCH /api/users/:id` - Cập nhật thông tin user theo ID
- `DELETE /api/users/:id` - Xóa user (admin only)

### User Profile
- `GET /api/users/:id/profile` - Lấy profile công khai (public)
- `PATCH /api/users/:id/status` - Cập nhật trạng thái user (admin)
- `POST /api/users/:id/roles` - Thêm vai trò cho user (admin)
- `DELETE /api/users/:id/roles/:role` - Xóa vai trò của user (admin)

### User Settings
- `GET /api/users/me/notifications` - Lấy cài đặt thông báo ✅
- `PUT /api/users/me/notifications` - Cập nhật cài đặt thông báo ✅
- `GET /api/users/me/security` - Lấy cài đặt bảo mật ✅
- `PUT /api/users/me/security` - Cập nhật cài đặt bảo mật ✅

### User Statistics
- `GET /api/users/stats/overview` - Lấy thống kê user (admin)

## Authentication APIs
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/oauth/callback` - OAuth callback

## Activity APIs
- `GET /api/activities` - Lấy danh sách hoạt động
- `POST /api/activities` - Tạo hoạt động mới
- `GET /api/activities/stats` - Lấy thống kê hoạt động
- `POST /api/activities/stats/sync` - Đồng bộ thống kê
- `POST /api/activities/sync-all` - Đồng bộ toàn bộ
- `GET /api/activities/recent` - Lấy hoạt động gần đây
- `GET /api/activities/type/:type` - Lấy hoạt động theo loại
- `GET /api/activities/:id` - Lấy hoạt động theo ID
- `PATCH /api/activities/:id` - Cập nhật hoạt động
- `DELETE /api/activities/:id` - Xóa hoạt động

## Integration APIs
- `POST /api/integrations/sync` - Đồng bộ tích hợp
- `POST /api/integrations/sync/strava` - Đồng bộ Strava
- `POST /api/integrations/sync/garmin` - Đồng bộ Garmin

### Strava Integration
- `GET /api/integrations/strava/status` - Trạng thái kết nối Strava
- `POST /api/integrations/strava/authorize` - Kết nối Strava
- `GET /api/integrations/strava/callback` - Strava OAuth callback
- `POST /api/integrations/strava/disconnect` - Ngắt kết nối Strava

## Club APIs
- `GET /api/clubs` - Lấy danh sách CLB
- `POST /api/clubs` - Tạo CLB mới
- `GET /api/clubs/search` - Tìm kiếm CLB
- `GET /api/clubs/stats` - Thống kê CLB
- `GET /api/clubs/:id` - Lấy thông tin CLB
- `PATCH /api/clubs/:id` - Cập nhật CLB
- `DELETE /api/clubs/:id` - Xóa CLB
- `GET /api/clubs/:id/events` - Lấy sự kiện của CLB
- `GET /api/clubs/:id/members` - Lấy thành viên CLB

## Event APIs
- `GET /api/events` - Lấy danh sách sự kiện
- `POST /api/events` - Tạo sự kiện mới
- `GET /api/events/:id` - Lấy thông tin sự kiện
- `PATCH /api/events/:id` - Cập nhật sự kiện
- `DELETE /api/events/:id` - Xóa sự kiện

## Race APIs
- `GET /api/races` - Lấy danh sách giải chạy
- `POST /api/races` - Tạo giải chạy mới
- `GET /api/races/search` - Tìm kiếm giải chạy
- `GET /api/races/type/:type` - Lấy giải chạy theo loại
- `GET /api/races/club/:clubId` - Lấy giải chạy của CLB
- `GET /api/races/upcoming` - Lấy giải chạy sắp tới
- `GET /api/races/code/:raceCode` - Lấy giải chạy theo mã
- `GET /api/races/:id` - Lấy thông tin giải chạy
- `PATCH /api/races/:id` - Cập nhật giải chạy
- `DELETE /api/races/:id` - Xóa giải chạy

## Challenge APIs
- `GET /api/challenges` - Lấy danh sách thử thách
- `POST /api/challenges` - Tạo thử thách mới
- `GET /api/challenges/:id` - Lấy thông tin thử thách
- `PATCH /api/challenges/:id` - Cập nhật thử thách
- `DELETE /api/challenges/:id` - Xóa thử thách

## Achievement APIs
- `GET /api/achievements` - Lấy danh sách thành tích
- `POST /api/achievements` - Tạo thành tích mới
- `GET /api/achievements/:id` - Lấy thông tin thành tích
- `PATCH /api/achievements/:id` - Cập nhật thành tích
- `DELETE /api/achievements/:id` - Xóa thành tích
- `POST /api/achievements/award` - Trao thành tích
- `GET /api/achievements/user-achievements` - Lấy thành tích của user

## Social APIs
- `GET /api/social/feed` - Lấy feed xã hội
- `POST /api/social/posts` - Tạo bài viết
- `PATCH /api/social/posts/:postId` - Cập nhật bài viết
- `DELETE /api/social/posts/:postId` - Xóa bài viết
- `POST /api/social/posts/:postId/like` - Like bài viết
- `POST /api/social/posts/:postId/comments` - Thêm comment
- `PATCH /api/social/comments/:commentId` - Cập nhật comment
- `DELETE /api/social/comments/:commentId` - Xóa comment
- `POST /api/social/comments/:commentId/like` - Like comment
- `POST /api/social/posts/:postId/share` - Chia sẻ bài viết

## Payment APIs
- `GET /api/payments` - Lấy danh sách thanh toán
- `POST /api/payments` - Tạo thanh toán mới
- `GET /api/payments/:id` - Lấy thông tin thanh toán
- `PATCH /api/payments/:id` - Cập nhật thanh toán
- `DELETE /api/payments/:id` - Xóa thanh toán
- `POST /api/payments/process` - Xử lý thanh toán
- `POST /api/payments/refund` - Hoàn tiền

## Notification APIs
- `GET /api/notifications` - Lấy danh sách thông báo
- `POST /api/notifications` - Tạo thông báo mới
- `GET /api/notifications/:id` - Lấy thông tin thông báo
- `PATCH /api/notifications/:id` - Cập nhật thông báo
- `DELETE /api/notifications/:id` - Xóa thông báo

## Media APIs
- `GET /api/media` - Lấy danh sách media
- `POST /api/media` - Upload media
- `GET /api/media/:id` - Lấy thông tin media
- `PATCH /api/media/:id` - Cập nhật media
- `DELETE /api/media/:id` - Xóa media

## Analytics APIs
- `GET /api/analytics` - Lấy dữ liệu phân tích

---

## ✅ Đã tối ưu hóa

### Loại bỏ API trùng lặp:
- ❌ `GET /api/users/me/profile` → ✅ `GET /api/users/me`
- ❌ `PUT /api/users/me/profile` → ✅ `PUT /api/users/me`

### Giữ lại API cần thiết:
- ✅ `GET /api/users/:id/profile` - Profile công khai (khác với profile cá nhân)
- ✅ `GET /api/users/me/notifications` - Cài đặt thông báo
- ✅ `PUT /api/users/me/notifications` - Cập nhật cài đặt thông báo
- ✅ `GET /api/users/me/security` - Cài đặt bảo mật
- ✅ `PUT /api/users/me/security` - Cập nhật cài đặt bảo mật

## 📝 Ghi chú

- Tất cả API đều có authentication (trừ public endpoints)
- User settings chỉ có thể truy cập qua `/me/` endpoints
- Profile công khai có thể truy cập qua `/:id/profile` endpoint
- Không có API trùng lặp chức năng
