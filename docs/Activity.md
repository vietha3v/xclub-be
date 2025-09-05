# Activity Module - X-Club System

## Tổng quan
Activity Module là module cốt lõi của hệ thống X-Club, quản lý toàn bộ hoạt động chạy bộ của người dùng thông qua việc đồng bộ hóa dữ liệu từ các nền tảng thể thao bên thứ 3.

## Mục đích
- **Đồng bộ hóa dữ liệu hoạt động** từ các nền tảng đáng tin cậy
- **Đảm bảo tính xác thực** của mọi hoạt động chạy bộ
- **Ngăn chặn gian lận** và khai báo sai hoạt động
- **Cung cấp dữ liệu chính xác** cho các tính năng khác của hệ thống

## Phạm vi
### Bao gồm:
- Hoạt động chạy bộ (running, jogging, trail running)
- Hoạt động đi bộ (walking, hiking)
- Hoạt động đạp xe (cycling, mountain biking)
- Hoạt động bơi lội (swimming)
- Hoạt động thể thao khác (yoga, weight training)

### Không bao gồm:
- Tạo hoạt động thủ công
- Chỉnh sửa dữ liệu hoạt động
- Xóa hoạt động

## Nguồn dữ liệu
### Các nền tảng được hỗ trợ:
1. **Strava** - Nền tảng thể thao phổ biến nhất
2. **Garmin Connect** - Dữ liệu từ thiết bị Garmin
3. **Apple Health** - Dữ liệu sức khỏe từ iOS
4. **Google Fit** - Dữ liệu từ Android

### Đặc điểm quan trọng:
- **KHÔNG** cho phép người dùng tạo activity thủ công
- **CHỈ** lấy dữ liệu từ các nền tảng đáng tin cậy
- Đảm bảo tính xác thực và độ tin cậy tuyệt đối

## Cấu trúc dữ liệu
### Thông tin cơ bản:
- **Tên và mô tả**: name, description, type, sportType
- **Thời gian**: startTime, endTime, duration, elapsedTime, movingTime
- **Khoảng cách và tốc độ**: distance, averageSpeed, maxSpeed, averagePace
- **Liên kết**: challengeId, eventId, raceId

### Dữ liệu sinh lý và hiệu suất:
- **Nhịp tim**: averageHeartRate, maxHeartRate, calories
- **Độ cao**: elevationGain, elevationLoss, totalElevationGain, maxElevation, minElevation
- **Power data**: kilojoules, averageWatts, maxWatts, weightedAverageWatts, deviceWatts
- **Cadence**: cadenceData (JSON)

### GPS và vị trí:
- **Tọa độ**: startLatitude, startLongitude, endLatitude, endLongitude
- **Địa điểm**: startLocation, endLocation
- **GPS tracks**: gpsData (JSON)
- **Tốc độ**: speedData (JSON)
- **Độ cao**: elevationData (JSON)

### Thông tin bổ sung:
- **Thiết bị**: equipment, gearId, deviceName, uploadId
- **Thời tiết**: temperature, humidity, windSpeed, roadCondition, weather (JSON)
- **Trạng thái**: trainer, commute, manual, private, flagged, workoutType
- **Đồng bộ**: source, externalId, lastSyncedAt, syncStatus

### Metadata:
- **Nguồn dữ liệu**: strava, garmin, apple_health, google_fit
- **ID từ nền tảng gốc**: externalId
- **Thời gian đồng bộ cuối**: lastSyncedAt
- **Trạng thái đồng bộ**: syncStatus

## Tương thích với Strava API v3
### Mapping trường dữ liệu:
- **Tên hoạt động**: `name` ↔ Strava `name`
- **Loại thể thao**: `sportType` ↔ Strava `sport_type`
- **Thời gian thực hiện**: `elapsedTime` ↔ Strava `elapsed_time`
- **Thời gian di chuyển**: `movingTime` ↔ Strava `moving_time`
- **Power data**: `kilojoules`, `averageWatts` ↔ Strava `kilojoules`, `average_watts`
- **Trạng thái**: `trainer`, `commute`, `manual` ↔ Strava `trainer`, `commute`, `manual`

### Dữ liệu JSON streams:
- **GPS tracks**: `gpsData` ↔ Strava `/activities/{id}/streams`
- **Nhịp tim**: `heartRateData` ↔ Strava heart rate streams
- **Power**: `powerData` ↔ Strava power streams
- **Cadence**: `cadenceData` ↔ Strava cadence streams

## Quy trình hoạt động
### 1. Kết nối nền tảng:
- **Integration Module** xử lý việc kết nối OAuth 2.0 với nền tảng thứ 3
- **Activity Module** chỉ nhận dữ liệu đã được xác thực
- Xem chi tiết: [Integration Module](./Integration.md)

### 2. Đồng bộ dữ liệu (TỰ ĐỘNG):
- **Hệ thống tự động lấy dữ liệu mới** từ nền tảng thứ 3
- **KHÔNG có API tạo/sửa/xóa activity thủ công cho người dùng**
- **CHỈ có API tạo activity qua Integration Module** (createFromIntegration)
- Xử lý và chuẩn hóa dữ liệu từ nguồn gốc
- Lưu vào database với metadata đầy đủ

### 3. Xử lý dữ liệu:
- Tính toán các chỉ số bổ sung (pace, calories, elevation)
- Liên kết với các module khác (challenge, event, race)
- Cập nhật thống kê người dùng và câu lạc bộ
- Tự động trao huy chương khi đạt điều kiện

### 4. Quy tắc nghiệp vụ nghiêm ngặt:
- **NGHIÊM CẤM** người dùng tạo activity thủ công
- **CHỈ CHO PHÉP** tạo activity qua Integration Module
- **ADMIN** có thể tạo activity (với kiểm tra quyền nghiêm ngặt)
- **TẤT CẢ** activity phải có nguồn gốc từ thiết bị/nền tảng đáng tin cậy

## Tác vụ đồng bộ hóa
### Đồng bộ tự động:
- **Cron job** chạy theo lịch trình (mỗi 15 phút, 1 giờ, 1 ngày)
- **Webhook** nhận dữ liệu real-time từ nền tảng thứ 3
- **API polling** để lấy dữ liệu mới khi cần thiết

### Xử lý đồng bộ:
- **Validation**: Kiểm tra tính hợp lệ của dữ liệu
- **Deduplication**: Loại bỏ dữ liệu trùng lặp
- **Enrichment**: Bổ sung thông tin bổ sung (thời tiết, địa điểm)
- **Linking**: Liên kết với các module khác

### Quản lý lỗi:
- **Retry mechanism**: Thử lại khi đồng bộ thất bại
- **Error logging**: Ghi log lỗi để debug
- **Fallback**: Sử dụng phương pháp dự phòng khi cần

## Quy trình đồng bộ hóa chi tiết
### 1. Thiết lập kết nối:
- Xem chi tiết: [Integration Module - Quy trình kết nối](./Integration.md#quy-trình-tích-hợp-integration-workflow)

### 2. Đồng bộ theo lịch trình (Cron Job):
```
Mỗi 15 phút: Kiểm tra người dùng có hoạt động mới
Mỗi 1 giờ: Đồng bộ dữ liệu chi tiết (GPS, nhịp tim)
Mỗi 1 ngày: Đồng bộ thống kê tổng hợp
```

### 3. Đồng bộ qua Webhook (Real-time):
```
Integration Module → Webhook → Activity Module
↓
Xử lý dữ liệu ngay lập tức
↓
Cập nhật database và thông báo
```

### 4. Xử lý dữ liệu đồng bộ:
```
Dữ liệu thô → Validation → Enrichment → Storage → Linking
↓
Kiểm tra tính hợp lệ → Bổ sung thông tin → Lưu vào DB → Liên kết module
```

### 5. Cập nhật hệ thống:
```
Activity mới → Cập nhật thống kê người dùng
↓
Kiểm tra điều kiện thử thách → Cập nhật tiến độ
↓
Kiểm tra điều kiện thành tích → Trao huy chương
↓
Cập nhật bảng xếp hạng → Gửi thông báo
```

## Mối quan hệ với các module khác
### Integration Module:
- **Integration Module** xử lý kết nối OAuth 2.0 với nền tảng thứ 3
- **Activity Module** chỉ nhận dữ liệu đã được xác thực từ Integration Module
- **SyncActivityService** sử dụng **ActivityService.createFromIntegration()** để tạo/cập nhật activity
- Xem chi tiết: [Integration Module](./Integration.md)

### Challenge Module:
- Activity được sử dụng để tính tiến độ thử thách
- Tự động cập nhật khi có hoạt động mới

### Event Module:
- Activity có thể liên kết với sự kiện
- Theo dõi hoạt động trong thời gian sự kiện

### Race Module:
- Activity được sử dụng để tính thành tích giải chạy
- Xác minh hoàn thành giải chạy

### Club Module:
- Activity có thể được chia sẻ trong câu lạc bộ
- Thống kê hoạt động của thành viên

### Achievement Module:
- Activity được sử dụng để tính toán thành tích
- Tự động trao huy chương khi đạt điều kiện

## Lợi ích
### Cho người dùng:
- Dữ liệu hoạt động chính xác và đáng tin cậy
- Không cần nhập liệu thủ công
- Đồng bộ tự động, tiết kiệm thời gian

### Cho hệ thống:
- Đảm bảo tính toàn vẹn dữ liệu
- Ngăn chặn gian lận và khai báo sai
- Cơ sở dữ liệu đáng tin cậy cho các tính năng khác

### Cho cộng đồng:
- Bảng xếp hạng công bằng và minh bạch
- Thách thức và sự kiện có ý nghĩa
- Cộng đồng thể thao lành mạnh

## Ví dụ sử dụng
### Kịch bản 1: Đồng bộ từ Strava
1. Người dùng hoàn thành chạy 10km với Strava
2. Strava ghi nhận hoạt động với đầy đủ dữ liệu (GPS, nhịp tim, power)
3. X-Club tự động đồng bộ qua webhook với tất cả trường dữ liệu
4. Hoạt động được hiển thị trong profile với thông tin chi tiết
5. Tự động cập nhật tiến độ thử thách và tính toán thành tích

### Kịch bản 2: Phân tích power data (cycling)
1. Người dùng đạp xe với power meter
2. Strava ghi nhận power data (watts, kilojoules)
3. X-Club đồng bộ và lưu trữ power data
4. Hệ thống tính toán FTP và power zones
5. Hiển thị phân tích hiệu suất chi tiết

### Kịch bản 2: Tham gia sự kiện
1. Người dùng đăng ký sự kiện chạy
2. Trong thời gian sự kiện, hoạt động được liên kết
3. Hệ thống tính toán thành tích
4. Tự động trao huy chương khi hoàn thành

## Kiến trúc hệ thống đồng bộ hóa
### Các thành phần chính:
1. **Sync Service**: Dịch vụ chính xử lý đồng bộ hóa
2. **Data Processor**: Xử lý và chuẩn hóa dữ liệu
3. **Queue System**: Hàng đợi xử lý đồng bộ bất đồng bộ
4. **Error Handler**: Xử lý lỗi và retry mechanism

### Luồng dữ liệu:
```
Integration Module → Queue → Data Processor → Database
        ↓              ↓           ↓           ↓
    OAuth/Webhook → Redis →   Service   → PostgreSQL
```

### Bảo mật:
- Xem chi tiết bảo mật OAuth 2.0: [Integration Module](./Integration.md)

## Tương lai
### Tính năng dự kiến:
- Hỗ trợ thêm nền tảng thể thao
- Phân tích dữ liệu nâng cao
- Dự đoán hiệu suất
- Gợi ý luyện tập cá nhân hóa

### Mở rộng:
- Tích hợp với thiết bị IoT
- Phân tích video chạy bộ
- So sánh hiệu suất với cộng đồng
- Phân tích xu hướng luyện tập
