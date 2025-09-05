# Integration Module - X-Club System

## Tổng quan
Integration Module là một service đơn giản của hệ thống X-Club, quản lý việc kết nối OAuth và lưu trữ token để đồng bộ dữ liệu từ các nền tảng thể thao bên thứ 3 (Strava, Garmin).

## Mục đích
- **Lưu trữ token OAuth** khi người dùng kết nối với Strava/Garmin
- **Đồng bộ dữ liệu** qua cron job hoặc manual sync
- **Đồng bộ thủ công** - người dùng có thể bấm nút đồng bộ ở Frontend
- **Đơn giản và hiệu quả** - sử dụng thư viện `strava-v3` để xử lý OAuth và API calls

## Phạm vi
### Bao gồm:
- **Nền tảng thể thao**: Strava, Garmin
- **Lưu trữ token OAuth** cho từng người dùng
- **Đồng bộ dữ liệu** qua cron job hoặc manual

### Không bao gồm:
- Xử lý dữ liệu hoạt động (thuộc Activity Module)
- Webhook phức tạp
- Tích hợp với các dịch vụ khác

## Nguồn dữ liệu tích hợp
### Nền tảng thể thao:
- **Strava**: Hoạt động chạy bộ, GPS, nhịp tim, power data
- **Garmin**: Dữ liệu từ thiết bị Garmin, workout, health metrics

## Cấu trúc dữ liệu
### Thông tin tích hợp:
- **Cấu hình**: API keys, secrets, endpoints
- **Xác thực**: Access tokens, refresh tokens, expiry times

### Thông tin người dùng:
- **Kết nối cá nhân**: External user ID, profile info
- **Token management**: Access token, refresh token, expiry
- **Trạng thái đồng bộ**: Sync status, last sync time

## Thư viện sử dụng
### strava-v3 (v2.2.1)
- **Mục đích**: Xử lý OAuth flow và API calls với Strava
- **Tính năng**: 
  - OAuth authorization URL generation
  - Token exchange (code → access_token)
  - API calls với rate limiting tự động
  - TypeScript support
- **Cài đặt**: `npm install strava-v3`
- **Cấu hình**: Environment variables (STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI)

## Quy trình hoạt động
### 1. Thiết lập kết nối:
- Người dùng click "Kết nối Strava" ở Frontend
- **Frontend** gọi `GET /api/integrations/strava/authorize`
- **Backend** sử dụng `strava.oauth.getRequestAccessURL()` tạo OAuth URL
- **User** redirect đến Strava OAuth page
- **Strava** redirect về `/integrations/callback` với authorization code
- **Callback page** gửi code lên `POST /api/integrations/strava/callback`
- **Backend** sử dụng `strava.oauth.getToken(code)` exchange code lấy token
- **Backend** lưu token vào `user_integrations` table

### 2. Đồng bộ dữ liệu:
- **Cron job**: Đồng bộ định kỳ mỗi 15 phút
- **Manual sync**: Người dùng bấm nút đồng bộ ở Frontend
- **API polling**: Sử dụng `strava.athlete.listActivities()` để lấy dữ liệu mới

### 3. Xử lý và lưu trữ:
- **SyncActivityService** sử dụng `strava.athlete.listActivities()` để lấy dữ liệu
- **ActivityService.createFromIntegration()** tạo/cập nhật activity
- Validation dữ liệu nhận được từ Strava API
- Chuẩn hóa format dữ liệu (mapStravaToActivity)
- Lưu trữ vào database tương ứng
- Cập nhật trạng thái đồng bộ

### 4. Quy tắc nghiệp vụ nghiêm ngặt:
- **CHỈ** Integration Module được phép tạo activity
- **NGHIÊM CẤM** người dùng tạo activity thủ công
- **TẤT CẢ** activity phải có nguồn gốc từ thiết bị/nền tảng đáng tin cậy
- **SyncActivityService** là cổng duy nhất để tạo activity từ nguồn bên ngoài

## Tác vụ đồng bộ hóa
### Đồng bộ tự động:
- **Mỗi 15 phút**: Kiểm tra hoạt động mới từ Strava/Garmin
- **Mỗi 1 giờ**: Đồng bộ dữ liệu chi tiết và metadata
- **Mỗi 1 ngày**: Đồng bộ thống kê tổng hợp

### Đồng bộ thủ công:
- **Người dùng bấm nút**: "Đồng bộ ngay" ở Frontend
- **Đồng bộ tức thì**: Không cần chờ cron job
- **Hiển thị tiến độ**: Loading bar và thông báo kết quả
- **API endpoint**: `POST /api/integrations/sync`
- **Response**: Số hoạt động mới, thời gian đồng bộ, trạng thái
- **Error handling**: Token hết hạn, lỗi mạng, rate limit

### Xử lý đồng bộ:
- **Validation**: Kiểm tra tính hợp lệ dữ liệu
- **Deduplication**: Loại bỏ dữ liệu trùng lặp
- **Enrichment**: Bổ sung thông tin bổ sung
- **Linking**: Liên kết với các module khác

### Quản lý lỗi:
- **Retry mechanism**: Thử lại khi đồng bộ thất bại
- **Error logging**: Ghi log lỗi để debug
- **Fallback**: Sử dụng phương pháp dự phòng
- **Alerting**: Thông báo lỗi cho admin

## Mối quan hệ với các module khác
### Activity Module:
- **Integration Module** xử lý kết nối OAuth và webhook
- **SyncActivityService** sử dụng **ActivityService.createFromIntegration()** để tạo/cập nhật activity
- **Activity Module** nhận dữ liệu đã được xác thực từ Integration Module
- Dữ liệu hoạt động được lưu vào bảng `activities` với nguồn gốc rõ ràng
- **NGHIÊM CẤM** tạo activity thủ công, chỉ cho phép qua Integration Module

### User Module:
- Quản lý kết nối tích hợp của từng người dùng
- Lưu trữ tokens và cài đặt cá nhân
- Theo dõi trạng thái kết nối

### Payment Module:
- Tích hợp với cổng thanh toán
- Xử lý webhook từ payment gateway
- Cập nhật trạng thái giao dịch

### Notification Module:
- Tích hợp với dịch vụ email và push notification
- Gửi thông báo qua các kênh khác nhau
- Theo dõi trạng thái gửi

## Lợi ích
### Cho người dùng:
- Kết nối dễ dàng với nền tảng yêu thích
- Đồng bộ dữ liệu tự động, tiết kiệm thời gian
- Dữ liệu chính xác và đáng tin cậy
- Trải nghiệm seamless giữa các nền tảng

### Cho hệ thống:
- Đảm bảo tính toàn vẹn dữ liệu
- Ngăn chặn gian lận và khai báo sai
- Cơ sở dữ liệu đáng tin cậy
- Khả năng mở rộng và tích hợp

### Cho cộng đồng:
- Bảng xếp hạng công bằng và minh bạch
- Thách thức và sự kiện có ý nghĩa
- Cộng đồng thể thao lành mạnh
- Kết nối với cộng đồng toàn cầu

## Ví dụ sử dụng
### Kịch bản 1: Kết nối Strava (với strava-v3)
1. **Người dùng** click "Kết nối với Strava" ở Frontend
2. **Frontend** gọi `GET /api/integrations/strava/authorize`
3. **Backend** sử dụng `strava.oauth.getRequestAccessURL()` tạo OAuth URL
4. **User** redirect đến Strava OAuth page
5. **User** đăng nhập và cấp quyền trên Strava
6. **Strava** redirect về `/integrations/callback` với authorization code
7. **Callback page** gửi code lên `POST /api/integrations/strava/callback`
8. **Backend** sử dụng `strava.oauth.getToken(code)` exchange code lấy token
9. **Backend** lưu token vào `user_integrations` table
10. **Hệ thống** bắt đầu đồng bộ dữ liệu

### Kịch bản 2: Đồng bộ thủ công (với strava-v3)
1. **Người dùng bấm nút** "Đồng bộ ngay" ở Frontend
2. **Frontend gọi API** `POST /api/integrations/sync` với userId
3. **Backend xử lý**:
   - **SyncActivityService** kiểm tra token còn hạn
   - Sử dụng `strava.athlete.listActivities({access_token: userToken})` lấy danh sách hoạt động mới
   - **ActivityService.createFromIntegration()** tạo/cập nhật activity
   - Lưu vào database (bảng activities) với nguồn gốc rõ ràng
   - Cập nhật lastSyncedAt trong user_integrations
4. **Response trả về**:
   ```json
   {
     "success": true,
     "newActivities": 5,
     "syncTime": "2024-01-15T10:30:00Z",
     "message": "Đồng bộ thành công 5 hoạt động mới"
   }
   ```
5. **Frontend hiển thị**: Thông báo thành công với số hoạt động mới

### Kịch bản 3: Luồng tạo Activity nghiêm ngặt (với strava-v3)
1. **Chỉ có 2 cách tạo Activity**:
   - **Qua Integration Module**: SyncActivityService sử dụng `strava.athlete.listActivities()` → ActivityService.createFromIntegration()
   - **Qua Admin**: ActivityService.create() với kiểm tra quyền nghiêm ngặt
2. **NGHIÊM CẤM** người dùng tạo activity thủ công
3. **TẤT CẢ** activity phải có nguồn gốc từ thiết bị/nền tảng đáng tin cậy
4. **ActivityService.createFromIntegration()** kiểm tra trùng lặp dựa trên sourceActivityId
5. **strava-v3** tự động xử lý rate limiting và error handling

### Kịch bản 4: Tích hợp thanh toán
1. Người dùng đăng ký sự kiện
2. Hệ thống tạo giao dịch thanh toán
3. Chuyển hướng đến cổng thanh toán (VNPay)
4. Người dùng hoàn thành thanh toán
5. VNPay gửi webhook xác nhận
6. Cập nhật trạng thái đăng ký

## API Endpoints
### OAuth Endpoints:
- `GET /integrations/strava/authorize` - Lấy OAuth URL từ Strava
- `POST /integrations/strava/callback` - Xử lý callback từ Strava OAuth

### Sync Endpoints:
- `POST /integrations/sync` - Đồng bộ thủ công tất cả platforms
- `POST /integrations/sync/strava` - Đồng bộ thủ công từ Strava
- `POST /integrations/sync/garmin` - Đồng bộ thủ công từ Garmin

## Environment Variables
```bash
# Strava OAuth Configuration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/integrations/callback
```

## Tương lai
### Tính năng dự kiến:
- Hỗ trợ thêm nền tảng thể thao (Garmin Connect API)
- Tích hợp với thiết bị IoT
- AI-powered data analysis
- Blockchain integration cho achievements

### Mở rộng:
- Hỗ trợ đa ngôn ngữ
- Tích hợp với social media
- Advanced analytics và reporting
- Machine learning cho personalization
