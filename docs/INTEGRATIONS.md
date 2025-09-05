# Integrations - X-Club System

## Tổng quan
Tài liệu này mô tả chi tiết tất cả các tích hợp và dịch vụ bên ngoài được sử dụng bởi hệ thống X-Club - ứng dụng quản lý câu lạc bộ chạy bộ với khả năng đồng bộ dữ liệu từ các nền tảng bên ngoài.

## 1. Tích hợp nền tảng thể thao và sức khỏe (Fitness & Health Platform Integrations)

### 1.1 Strava Integration
**Mô tả:** Tích hợp với Strava - nền tảng thể thao hàng đầu thế giới

**Tính năng:**
- Đồng bộ hoạt động chạy bộ
- Import dữ liệu GPS và route
- Đồng bộ thống kê và thành tích
- Kết nối với cộng đồng Strava

**API Endpoints:**
```
GET /oauth/authorize - Xác thực OAuth
GET /api/v3/athlete - Thông tin vận động viên
GET /api/v3/athlete/activities - Danh sách hoạt động
GET /api/v3/activities/{id} - Chi tiết hoạt động
GET /api/v3/activities/{id}/streams - Dữ liệu GPS và metrics
```

**Dữ liệu đồng bộ:**
- Thông tin hoạt động cơ bản
- Dữ liệu GPS (latitude, longitude, elevation)
- Thống kê (distance, time, pace, calories)
- Heart rate data (nếu có)
- Weather data
- Route và segments

**Tần suất đồng bộ:**
- Real-time: Qua webhook
- Định kỳ: Mỗi 15 phút
- Manual: Theo yêu cầu người dùng

### 1.2 Garmin Integration
**Mô tả:** Tích hợp với Garmin Connect - nền tảng quản lý thiết bị Garmin

**Tính năng:**
- Đồng bộ dữ liệu từ thiết bị Garmin
- Import hoạt động và workout
- Đồng bộ dữ liệu sức khỏe
- Kết nối với Garmin Connect

**API Endpoints:**
```
POST /oauth/access_token - Xác thực OAuth
GET /users/self/activities - Danh sách hoạt động
GET /users/self/activities/{id} - Chi tiết hoạt động
GET /users/self/activities/{id}/details - Chi tiết chi tiết
GET /users/self/activities/{id}/splits - Split times
```

**Dữ liệu đồng bộ:**
- Hoạt động từ thiết bị Garmin
- GPS data với độ chính xác cao
- Heart rate data
- Cadence và stride length
- Power data (nếu có)
- Training effect và load

**Thiết bị hỗ trợ:**
- Garmin Forerunner series
- Garmin Fenix series
- Garmin Vivoactive series
- Garmin Edge (cycling)

### 1.3 Apple Health Integration
**Mô tả:** Tích hợp với Apple HealthKit - nền tảng sức khỏe của Apple

**Tính năng:**
- Đồng bộ dữ liệu sức khỏe từ iOS
- Import hoạt động và workout
- Đồng bộ metrics sức khỏe
- Kết nối với Health app

**Framework:**
- HealthKit (iOS)
- Swift/Objective-C integration
- Background app refresh

**Dữ liệu đồng bộ:**
- Workout data (running, walking, hiking)
- Distance, duration, calories
- Heart rate data
- Steps và active energy
- Sleep data (nếu cho phép)
- Body metrics

**Quyền truy cập:**
- HealthKit authorization
- Background delivery
- Data sharing permissions

### 1.4 Google Fit Integration
**Mô tả:** Tích hợp với Google Fit - nền tảng sức khỏe của Google

**Tính năng:**
- Đồng bộ dữ liệu sức khỏe từ Android
- Import hoạt động và workout
- Đồng bộ metrics sức khỏe
- Kết nối với Google Fit app

**API Endpoints:**
```
POST /oauth2/v4/token - Xác thực OAuth 2.0
GET /fitness/v1/users/me/dataSources - Danh sách nguồn dữ liệu
GET /fitness/v1/users/me/dataset:aggregate - Dữ liệu tổng hợp
GET /fitness/v1/users/me/sessions - Danh sách workout
```

**Dữ liệu đồng bộ:**
- Activity data (running, walking, hiking)
- Distance, duration, calories
- Heart rate data
- Steps và active minutes
- Sleep data (nếu cho phép)
- Body metrics

**Quyền truy cập:**
- OAuth 2.0 scopes
- Fitness data permissions
- Background sync

## 2. Tích hợp cổng thanh toán (Payment Gateway Integrations)

### 2.1 VNPay Integration
**Mô tả:** Tích hợp với VNPay - cổng thanh toán hàng đầu Việt Nam

**Tính năng:**
- Thanh toán online
- QR code payment
- Internet banking
- Mobile banking

**API Endpoints:**
```
POST /payment/v2/transaction - Tạo giao dịch
GET /payment/v2/transaction/{id} - Kiểm tra trạng thái
POST /payment/v2/refund - Hoàn tiền
```

**Phương thức thanh toán:**
- ATM nội địa
- Thẻ quốc tế (Visa, Mastercard)
- QR code
- Internet banking

**Bảo mật:**
- Hash validation
- IPN (Instant Payment Notification)
- SSL/TLS encryption

### 2.2 Momo Integration
**Mô tả:** Tích hợp với MoMo - ví điện tử phổ biến tại Việt Nam

**Tính năng:**
- Thanh toán qua ví MoMo
- QR code payment
- Deep linking
- Push notification

**API Endpoints:**
```
POST /v2/gateway/api/create - Tạo giao dịch
GET /v2/gateway/api/status - Kiểm tra trạng thái
POST /v2/gateway/api/refund - Hoàn tiền
```

**Phương thức thanh toán:**
- Ví MoMo
- QR code
- Deep link
- SMS

**Bảo mật:**
- Partner code và secret key
- Hash validation
- IPN callback

### 2.3 ZaloPay Integration
**Mô tả:** Tích hợp với ZaloPay - ví điện tử của Zalo

**Tính năng:**
- Thanh toán qua ZaloPay
- QR code payment
- Zalo app integration
- Social payment

**API Endpoints:**
```
POST /v2/order/create - Tạo đơn hàng
GET /v2/order/status - Kiểm tra trạng thái
POST /v2/order/refund - Hoàn tiền
```

**Phương thức thanh toán:**
- Ví ZaloPay
- QR code
- Zalo app
- Bank transfer

**Bảo mật:**
- App ID và secret key
- Hash validation
- Callback URL

## 3. Tích hợp dịch vụ email (Email Service Integrations)

### 3.1 SendGrid Integration
**Mô tả:** Tích hợp với SendGrid - dịch vụ email marketing hàng đầu

**Tính năng:**
- Gửi email xác thực
- Email thông báo
- Email marketing
- Template email

**API Endpoints:**
```
POST /v3/mail/send - Gửi email
GET /v3/mail/settings - Cài đặt email
GET /v3/stats - Thống kê email
```

**Loại email:**
- Welcome email
- Email xác thực
- Thông báo hoạt động
- Newsletter
- Email marketing

**Template:**
- HTML responsive
- Dynamic content
- Personalization
- A/B testing

### 3.2 Nodemailer Integration
**Mô tả:** Sử dụng Nodemailer - thư viện email cho Node.js

**Tính năng:**
- Gửi email SMTP
- Email đơn giản
- Template cơ bản
- File attachment

**Cấu hình SMTP:**
- Gmail SMTP
- Outlook SMTP
- Custom SMTP server
- SSL/TLS support

## 4. Tích hợp thông báo đẩy (Push Notification Integrations)

### 4.1 Firebase Cloud Messaging (FCM)
**Mô tả:** Tích hợp với FCM - dịch vụ thông báo đẩy của Google

**Tính năng:**
- Push notification cho Android
- In-app messaging
- Topic messaging
- Analytics

**API Endpoints:**
```
POST /fcm/send - Gửi thông báo
POST /fcm/send - Gửi thông báo topic
GET /fcm/notification - Quản lý thông báo
```

**Loại thông báo:**
- Achievement unlocked
- Event reminder
- Club activity
- Social interaction
- System notification

**Cấu hình:**
- Server key
- Topic subscription
- Priority levels
- Time to live

### 4.2 Apple Push Notification Service (APNS)
**Mô tả:** Tích hợp với APNS - dịch vụ thông báo đẩy của Apple

**Tính năng:**
- Push notification cho iOS
- Silent notification
- Rich notification
- Action buttons

**Cấu hình:**
- APNs certificate
- Bundle ID
- Device token
- Payload format

## 5. Tích hợp dịch vụ bản đồ và vị trí (Map & Location Services)

### 5.1 Google Maps Integration
**Mô tả:** Tích hợp với Google Maps - dịch vụ bản đồ hàng đầu

**Tính năng:**
- Hiển thị bản đồ
- Geocoding và reverse geocoding
- Route planning
- Place search

**API Endpoints:**
```
GET /maps/api/geocode/json - Geocoding
GET /maps/api/directions/json - Route planning
GET /maps/api/place/search/json - Place search
GET /maps/api/staticmap - Static map
```

**Dịch vụ:**
- Maps JavaScript API
- Geocoding API
- Directions API
- Places API
- Static Maps API

**Giới hạn:**
- 2,500 requests/day (free)
- 100,000 requests/day (paid)

### 5.2 OpenStreetMap Integration
**Mô tả:** Sử dụng OpenStreetMap - bản đồ mã nguồn mở

**Tính năng:**
- Hiển thị bản đồ
- Geocoding
- Route planning
- Tile server

**Dịch vụ:**
- Nominatim (geocoding)
- OSRM (routing)
- Map tiles
- POI data

**Ưu điểm:**
- Miễn phí
- Dữ liệu cập nhật
- Cộng đồng lớn
- Không giới hạn request

## 6. Tích hợp AI và Machine Learning (AI & Machine Learning Integrations)

### 6.1 OpenAI Integration
**Mô tả:** Tích hợp với OpenAI - nền tảng AI hàng đầu

**Tính năng:**
- AI coaching cho chạy bộ
- Phân tích hoạt động
- Gợi ý cải thiện
- Chatbot hỗ trợ

**API Endpoints:**
```
POST /v1/chat/completions - Chat completion
POST /v1/completions - Text completion
POST /v1/images/generations - Image generation
```

**Model sử dụng:**
- GPT-4: Coaching và tư vấn
- GPT-3.5: Hỗ trợ cơ bản
- DALL-E: Tạo hình ảnh
- Whisper: Chuyển đổi giọng nói

**Ứng dụng:**
- AI running coach
- Performance analysis
- Training plan generation
- Injury prevention advice

### 6.2 TensorFlow.js Integration
**Mô tả:** Sử dụng TensorFlow.js - thư viện ML cho JavaScript

**Tính năng:**
- ML model trong browser
- Real-time prediction
- Offline processing
- Custom models

**Ứng dụng:**
- Pace prediction
- Performance analysis
- Anomaly detection
- Personalization

## 7. Tích hợp phân tích và giám sát (Analytics & Monitoring Integrations)

### 7.1 Google Analytics 4 (GA4)
**Mô tả:** Tích hợp với GA4 - nền tảng phân tích web

**Tính năng:**
- User behavior tracking
- Event tracking
- Conversion tracking
- Custom dimensions

**Events tracking:**
- User registration
- Activity creation
- Club joining
- Event participation
- Payment completion

**Metrics:**
- User engagement
- Retention rate
- Conversion rate
- User journey

### 7.2 Sentry Integration
**Mô tả:** Tích hợp với Sentry - nền tảng giám sát lỗi

**Tính năng:**
- Error tracking
- Performance monitoring
- Release tracking
- User feedback

**Monitoring:**
- JavaScript errors
- API errors
- Performance metrics
- User sessions

## 8. Tích hợp Webhook và Real-time (Webhook & Real-time Integrations)

### 8.1 Webhook System
**Mô tả:** Hệ thống webhook để nhận dữ liệu real-time

**Tính năng:**
- Nhận dữ liệu từ Strava
- Nhận dữ liệu từ Garmin
- Payment notifications
- Third-party integrations

**Security:**
- Webhook signature verification
- IP whitelist
- Rate limiting
- Authentication

### 8.2 WebSocket Integration
**Mô tả:** Sử dụng WebSocket cho real-time communication

**Tính năng:**
- Live activity updates
- Real-time notifications
- Live chat
- Live tracking

**Implementation:**
- Socket.io
- Real-time updates
- Connection management
- Error handling

## 9. Cấu hình tích hợp (Integration Configuration)

### 9.1 Environment Variables
```env
# Strava
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_WEBHOOK_SECRET=your_webhook_secret

# Garmin
GARMIN_CONSUMER_KEY=your_consumer_key
GARMIN_CONSUMER_SECRET=your_consumer_secret

# Payment Gateways
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
MOMO_PARTNER_CODE=your_partner_code
MOMO_SECRET_KEY=your_secret_key

# Email Services
SENDGRID_API_KEY=your_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Push Notifications
FCM_SERVER_KEY=your_server_key
APNS_CERT_PATH=path_to_certificate
APNS_KEY_PATH=path_to_key

# Maps
GOOGLE_MAPS_API_KEY=your_api_key
OPENSTREETMAP_TILE_URL=your_tile_url

# AI Services
OPENAI_API_KEY=your_api_key
OPENAI_ORGANIZATION=your_organization

# Analytics
GA4_MEASUREMENT_ID=your_measurement_id
GA4_API_SECRET=your_api_secret
SENTRY_DSN=your_dsn
```

### 9.2 Database Schema
```sql
-- Integrations table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integrationCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    clubId UUID REFERENCES clubs(id),
    createdBy UUID REFERENCES users(id),
    apiKey TEXT,
    apiSecret TEXT,
    accessToken TEXT,
    refreshToken TEXT,
    tokenExpiry TIMESTAMP,
    webhookUrl TEXT,
    callbackUrl TEXT,
    configuration JSONB,
    credentials JSONB,
    settings JSONB,
    cost DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    usageLimits JSONB,
    stats JSONB,
    lastError TEXT,
    lastErrorAt TIMESTAMP,
    notes TEXT,
    tags TEXT[],
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Integrations table
CREATE TABLE user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    integrationId UUID REFERENCES integrations(id) ON DELETE CASCADE,
    externalUserId VARCHAR(100),
    accessToken TEXT,
    refreshToken TEXT,
    tokenExpiry TIMESTAMP,
    lastSyncedAt TIMESTAMP,
    syncStatus VARCHAR(50) DEFAULT 'active',
    settings JSONB,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, integrationId)
);
```

## 10. Quy trình tích hợp (Integration Workflow)

### 10.1 Quy trình kết nối
1. **Người dùng chọn nền tảng tích hợp**
2. **Hệ thống chuyển hướng đến OAuth**
3. **Người dùng cấp quyền truy cập**
4. **Hệ thống nhận callback với authorization code**
5. **Hệ thống trao đổi code lấy access token**
6. **Lưu trữ thông tin tích hợp**
7. **Bắt đầu đồng bộ dữ liệu**

### 10.2 Quy trình đồng bộ
1. **Kiểm tra kết nối và token**
2. **Lấy danh sách hoạt động mới**
3. **Import dữ liệu vào hệ thống**
4. **Xử lý và chuẩn hóa dữ liệu**
5. **Cập nhật trạng thái đồng bộ**
6. **Gửi thông báo hoàn thành**

### 10.3 Quy trình xử lý lỗi
1. **Phát hiện lỗi đồng bộ**
2. **Ghi log lỗi chi tiết**
3. **Thử lại theo retry policy**
4. **Gửi thông báo lỗi cho admin**
5. **Cập nhật trạng thái tích hợp**
6. **Thông báo cho người dùng**

## 11. Bảo mật tích hợp (Integration Security)

### 11.1 OAuth 2.0 Security
- **State parameter** để ngăn CSRF attack
- **PKCE** cho public clients
- **Scope limitation** để giới hạn quyền truy cập
- **Token rotation** để tăng bảo mật

### 11.2 API Security
- **Rate limiting** để ngăn abuse
- **IP whitelist** cho webhook
- **Signature verification** cho webhook
- **HTTPS** cho tất cả API calls

### 11.3 Data Security
- **Encryption** cho sensitive data
- **Token storage** an toàn
- **Access logging** để audit
- **Data retention** policy

## 12. Monitoring và Analytics tích hợp (Integration Monitoring)

### 12.1 Health Checks
- **Connection status** của mỗi integration
- **Token validity** và expiry
- **Sync success rate**
- **Error rate** và types

### 12.2 Performance Metrics
- **Response time** của API calls
- **Throughput** của data sync
- **Resource usage** (CPU, memory, network)
- **Cost tracking** cho paid services

### 12.3 Alerting
- **Integration failures**
- **High error rates**
- **Token expiration** warnings
- **Cost threshold** alerts

## Kết luận

Hệ thống tích hợp của X-Club được thiết kế để cung cấp trải nghiệm seamless cho người dùng, cho phép họ kết nối và đồng bộ dữ liệu từ các nền tảng yêu thích. Việc tuân thủ các tiêu chuẩn bảo mật và best practices đảm bảo tính bảo mật và độ tin cậy của hệ thống.
