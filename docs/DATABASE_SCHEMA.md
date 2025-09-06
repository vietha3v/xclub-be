# Database Schema - X-Club System

## Tổng quan
Hệ thống X-Club sử dụng PostgreSQL làm cơ sở dữ liệu chính, với cấu trúc bảng được thiết kế theo nguyên tắc "thông tin cốt lõi + khóa ngoại" để tối ưu hiệu suất truy vấn.

## Cấu trúc Database

### 1. Bảng Users (Người dùng)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),
    avatar TEXT,
    roles TEXT[] DEFAULT ARRAY['runner'],
    experience VARCHAR(50) DEFAULT 'beginner',
    status VARCHAR(50) DEFAULT 'active',
    isVerified BOOLEAN DEFAULT false,
    isPublic BOOLEAN DEFAULT false,
    referralCode VARCHAR(50),
    lastLoginAt TIMESTAMP,
    lastActivityAt TIMESTAMP,
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Bảng Clubs (Câu lạc bộ)
```sql
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    logo TEXT,
    banner TEXT,
    location TEXT,
    contactInfo JSONB,
    settings JSONB,
    isActive BOOLEAN DEFAULT true,
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Bảng Club_Members (Thành viên câu lạc bộ)
```sql
CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clubId UUID REFERENCES clubs(id) ON DELETE CASCADE,
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    UNIQUE(clubId, userId)
);
```

### 4. Bảng Activities (Hoạt động chạy bộ)
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activityCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255), -- Tên hoạt động (Strava: name)
    description TEXT, -- Mô tả hoạt động (Strava: description)
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    clubId UUID REFERENCES clubs(id),
    eventId UUID REFERENCES events(id), -- ID sự kiện liên quan
    challengeId UUID REFERENCES challenges(id), -- ID thử thách liên quan
    raceId UUID, -- ID giải chạy liên quan
    
    -- Loại hoạt động
    type VARCHAR(50) NOT NULL, -- running, walking, trekking, trail_running, jogging
    sportType VARCHAR(50), -- Loại thể thao (Strava: sport_type)
    status VARCHAR(50) DEFAULT 'completed',
    visibility VARCHAR(50) DEFAULT 'private',
    isPublic BOOLEAN DEFAULT false,
    
    -- Thời gian
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    duration DECIMAL(10,2), -- seconds
    elapsedTime INTEGER, -- Thời gian thực hiện (Strava: elapsed_time)
    movingTime INTEGER, -- Thời gian di chuyển (Strava: moving_time)
    
    -- Khoảng cách và tốc độ
    distance DECIMAL(10,3), -- km
    averageSpeed DECIMAL(5,2), -- km/h
    maxSpeed DECIMAL(5,2), -- km/h
    averagePace DECIMAL(8,2), -- s/km
    
    -- Sinh lý
    averageHeartRate INTEGER, -- BPM
    maxHeartRate INTEGER, -- BPM
    calories INTEGER,
    
    -- Độ cao
    elevationGain DECIMAL(8,2), -- m
    elevationLoss DECIMAL(8,2), -- m
    totalElevationGain DECIMAL(8,2), -- m
    maxElevation DECIMAL(8,2), -- m
    minElevation DECIMAL(8,2), -- m
    
    -- GPS và vị trí
    startLatitude DECIMAL(10,8),
    startLongitude DECIMAL(11,8),
    endLatitude DECIMAL(10,8),
    endLongitude DECIMAL(11,8),
    startLocation VARCHAR(255),
    endLocation VARCHAR(255),
    
    -- Dữ liệu JSON
    gpsData JSONB, -- Dữ liệu GPS từ Strava/Garmin
    heartRateData JSONB, -- Dữ liệu nhịp tim
    speedData JSONB, -- Dữ liệu tốc độ
    elevationData JSONB, -- Dữ liệu độ cao
    cadenceData JSONB, -- Dữ liệu cadence
    powerData JSONB, -- Dữ liệu power
    weather JSONB, -- Thông tin thời tiết
    
    -- Thông tin bổ sung
    equipment VARCHAR(255), -- Thiết bị sử dụng
    gearId VARCHAR(100), -- ID thiết bị (Strava: gear_id)
    deviceName VARCHAR(255), -- Tên thiết bị (Strava: device_name)
    
    -- Trạng thái hoạt động
    trainer BOOLEAN DEFAULT false, -- Hoạt động tập luyện (Strava: trainer)
    commute BOOLEAN DEFAULT false, -- Hoạt động đi lại (Strava: commute)
    manual BOOLEAN DEFAULT false, -- Hoạt động thủ công (Strava: manual)
    private BOOLEAN DEFAULT false, -- Hoạt động riêng tư (Strava: private)
    flagged BOOLEAN DEFAULT false, -- Hoạt động bị đánh dấu (Strava: flagged)
    
    -- Power data (cho cycling)
    kilojoules DECIMAL(8,2), -- Tổng công suất (Strava: kilojoules)
    averageWatts DECIMAL(8,2), -- Công suất trung bình (Strava: average_watts)
    maxWatts INTEGER, -- Công suất tối đa (Strava: max_watts)
    weightedAverageWatts INTEGER, -- Công suất chuẩn hóa (Strava: weighted_average_watts)
    deviceWatts BOOLEAN DEFAULT false, -- Watts từ thiết bị (Strava: device_watts)
    
    -- Thông tin bổ sung
    workoutType INTEGER, -- Loại workout (Strava: workout_type)
    uploadId VARCHAR(100), -- ID upload (Strava: upload_id_str)
    embedToken VARCHAR(255), -- Token nhúng (Strava: embed_token)
    
    -- Thời tiết
    temperature DECIMAL(4,1), -- Nhiệt độ (Celsius)
    humidity DECIMAL(5,2), -- Độ ẩm (%)
    windSpeed DECIMAL(5,2), -- Gió (km/h)
    roadCondition VARCHAR(100), -- Điều kiện đường
    
    -- Đồng bộ
    source VARCHAR(50), -- strava, garmin, apple_health, google_fit
    externalId VARCHAR(100), -- ID từ platform gốc
    lastSyncedAt TIMESTAMP, -- Thời gian đồng bộ cuối
    syncStatus VARCHAR(50) DEFAULT 'synced', -- synced, pending, failed
    
    -- Quản lý
    notes TEXT,
    tags TEXT[],
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Bảng Events (Sự kiện chạy bộ)
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- training, competition, social, charity
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
    visibility VARCHAR(50) DEFAULT 'club_only', -- club_only, public
    clubId UUID REFERENCES clubs(id) ON DELETE CASCADE,
    createdBy UUID REFERENCES users(id),
    
    -- Thời gian sự kiện
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    registrationStartDate TIMESTAMP,
    registrationEndDate TIMESTAMP,
    
    -- Địa điểm
    location TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    
    -- Thông tin chung
    contactInfo JSONB,
    coverImageUrl TEXT,
    additionalImages TEXT[],
    tags TEXT[],
    
    -- Quản lý
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Bảng Challenges (Thử thách trong sự kiện)
```sql
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challengeCode VARCHAR(20) UNIQUE NOT NULL,
    eventId UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- distance, frequency, speed, time, combined
    
    -- Mục tiêu thử thách
    targetValue DECIMAL(10,2) NOT NULL, -- Giá trị mục tiêu
    targetUnit VARCHAR(20) NOT NULL, -- km, days, pace, hours
    timeLimit INTEGER NOT NULL, -- Giới hạn thời gian (days)
    
    -- Điều kiện tham gia
    minOccurrences INTEGER DEFAULT 1, -- Số lần tối thiểu
    minStreak INTEGER DEFAULT 1, -- Chuỗi liên tiếp tối thiểu
    minDistance DECIMAL(8,2), -- Khoảng cách tối thiểu mỗi lần
    maxDistance DECIMAL(8,2), -- Khoảng cách tối đa mỗi lần
    
    -- Phần thưởng
    achievementId UUID REFERENCES achievements(id), -- Huy chương liên kết
    points INTEGER DEFAULT 0, -- Điểm thưởng
    rewards JSONB, -- Phần thưởng khác
    
    -- Trạng thái
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    
    -- Thống kê
    participantCount INTEGER DEFAULT 0,
    completedCount INTEGER DEFAULT 0,
    
    -- Quản lý
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Bảng Challenge_Participants (Người tham gia thử thách)
```sql
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challengeId UUID REFERENCES challenges(id) ON DELETE CASCADE,
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Trạng thái tham gia
    status VARCHAR(50) DEFAULT 'active', -- active, completed, dropped, disqualified
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP,
    
    -- Tiến độ
    currentProgress DECIMAL(10,2) DEFAULT 0, -- Tiến độ hiện tại
    currentStreak INTEGER DEFAULT 0, -- Chuỗi hiện tại
    lastActivityAt TIMESTAMP, -- Hoạt động cuối cùng
    
    -- Thành tích
    finalRank INTEGER, -- Xếp hạng cuối cùng
    finalScore DECIMAL(10,2), -- Điểm số cuối cùng
    completionTime INTEGER, -- Thời gian hoàn thành (seconds)
    
    -- Hoạt động liên quan
    relatedActivities TEXT[], -- Array of activity IDs
    
    -- Quản lý
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(challengeId, userId)
);
```

### 8. Bảng Challenge_Leaderboards (Bảng xếp hạng thử thách)
```sql
CREATE TABLE challenge_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challengeId UUID REFERENCES challenges(id) ON DELETE CASCADE,
    
    -- Thông tin xếp hạng
    rank INTEGER NOT NULL, -- Thứ hạng
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(10,2) NOT NULL, -- Điểm số
    progress DECIMAL(10,2) NOT NULL, -- Tiến độ
    streak INTEGER DEFAULT 0, -- Chuỗi liên tiếp
    
    -- Thời gian
    lastUpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Quản lý
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(challengeId, rank, userId)
);
```

### 9. Bảng Races (Giải chạy)
```sql
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raceCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- marathon, half_marathon, 10k, 5k, trail
    status VARCHAR(50) DEFAULT 'upcoming',
    visibility VARCHAR(50) DEFAULT 'public',
    clubId UUID REFERENCES clubs(id) ON DELETE CASCADE,
    createdBy UUID REFERENCES users(id),
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    registrationStartDate TIMESTAMP,
    registrationEndDate TIMESTAMP,
    maxParticipants INTEGER,
    minParticipants INTEGER DEFAULT 1,
    mainDistance DECIMAL(8,2), -- km
    additionalDistances DECIMAL(8,2)[], -- km
    timeLimit INTEGER, -- seconds
    startLocation TEXT,
    finishLocation TEXT,
    startLatitude DECIMAL(10,8),
    startLongitude DECIMAL(11,8),
    finishLatitude DECIMAL(10,8),
    finishLongitude DECIMAL(11,8),
    address TEXT,
    contactInfo JSONB,
    registrationFee DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'VND',
    rules TEXT,
    requirements TEXT,
    rewards JSONB,
    coverImageUrl TEXT,
    additionalImages TEXT[],
    tags TEXT[],
    participants TEXT[], -- Array of user IDs
    completers TEXT[], -- Array of user IDs who completed
    stats JSONB, -- Thống kê giải chạy
    settings JSONB,
    allowRegistration BOOLEAN DEFAULT true,
    requireApproval BOOLEAN DEFAULT false,
    allowWithdrawal BOOLEAN DEFAULT true,
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Bảng Achievements (Thành tích, huy chương)
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievementCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- distance, speed, frequency, streak, special
    tier VARCHAR(50) NOT NULL, -- bronze, silver, gold, platinum, diamond
    status VARCHAR(50) DEFAULT 'active',
    clubId UUID REFERENCES clubs(id),
    eventId UUID REFERENCES events(id), -- ID sự kiện liên quan
    challengeId UUID REFERENCES challenges(id), -- ID thử thách liên quan
    createdBy UUID REFERENCES users(id),
    conditions JSONB, -- Điều kiện để đạt được
    targetValue DECIMAL(10,2), -- Giá trị mục tiêu
    targetUnit VARCHAR(20), -- Đơn vị (km, hours, days, etc.)
    timeLimit INTEGER, -- Giới hạn thời gian (days)
    minOccurrences INTEGER DEFAULT 1, -- Số lần tối thiểu
    minStreak INTEGER DEFAULT 1, -- Chuỗi liên tiếp tối thiểu
    points INTEGER DEFAULT 0, -- Điểm thưởng
    badgeUrl TEXT, -- URL huy hiệu
    certificateUrl TEXT, -- URL chứng nhận
    rewards JSONB, -- Phần thưởng
    imageUrl TEXT,
    tags TEXT[],
    stats JSONB, -- Thống kê
    settings JSONB,
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Bảng User_Achievements (Thành tích của người dùng)
```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    achievementId UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress DECIMAL(10,2) DEFAULT 0, -- Tiến độ hiện tại
    isCompleted BOOLEAN DEFAULT false,
    completedAt TIMESTAMP,
    UNIQUE(userId, achievementId)
);
```

### 9. Bảng Integrations (Tích hợp nền tảng bên ngoài)
```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integrationCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT, -- Mô tả tích hợp
    type VARCHAR(50) NOT NULL, -- fitness_platform, payment_gateway, email_service, push_notification, map_service, ai_service, analytics, social_media, storage, other
    provider VARCHAR(100) NOT NULL, -- strava, garmin, apple_health, google_fit, vnpay, momo, zalopay, sendgrid, nodemailer, firebase, google_maps, openstreetmap, openai, google_analytics, sentry, other
    status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, error, maintenance, deprecated
    clubId UUID REFERENCES clubs(id),
    createdBy UUID REFERENCES users(id),
    
    -- Thông tin xác thực
    apiKey TEXT, -- API Key
    apiSecret TEXT, -- API Secret
    accessToken TEXT, -- Access Token
    refreshToken TEXT, -- Refresh Token
    tokenExpiry TIMESTAMP, -- Thời gian hết hạn token
    
    -- URL và webhook
    webhookUrl TEXT, -- URL webhook
    callbackUrl TEXT, -- URL callback OAuth
    redirectUrl TEXT, -- URL redirect sau OAuth
    
    -- Cấu hình và cài đặt
    configuration JSONB, -- Cấu hình tích hợp
    credentials JSONB, -- Thông tin xác thực bổ sung
    settings JSONB, -- Cài đặt tích hợp
    scopes TEXT[], -- Quyền truy cập OAuth
    
    -- Chi phí và giới hạn
    cost DECIMAL(10,2) DEFAULT 0, -- Phí sử dụng
    currency VARCHAR(3) DEFAULT 'VND', -- Đơn vị tiền tệ
    usageLimits JSONB, -- Giới hạn sử dụng
    rateLimits JSONB, -- Giới hạn tốc độ API
    
    -- Thống kê và giám sát
    stats JSONB, -- Thống kê sử dụng
    lastError TEXT, -- Lỗi cuối cùng
    lastErrorAt TIMESTAMP, -- Thời gian lỗi cuối
    errorCount INTEGER DEFAULT 0, -- Số lần lỗi
    lastSuccessAt TIMESTAMP, -- Thời gian thành công cuối
    
    -- Quản lý
    notes TEXT, -- Ghi chú tích hợp
    tags TEXT[], -- Tags tích hợp
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. Bảng User_Integrations (Tích hợp của người dùng)
```sql
CREATE TABLE user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    integrationId UUID REFERENCES integrations(id) ON DELETE CASCADE,
    
    -- Thông tin người dùng từ nền tảng bên ngoài
    externalUserId VARCHAR(100), -- ID từ platform bên ngoài
    externalUsername VARCHAR(255), -- Username từ platform bên ngoài
    externalProfileUrl TEXT, -- URL profile từ platform bên ngoài
    
    -- Thông tin xác thực
    accessToken TEXT, -- Access Token
    refreshToken TEXT, -- Refresh Token
    tokenExpiry TIMESTAMP, -- Thời gian hết hạn token
    tokenType VARCHAR(50) DEFAULT 'Bearer', -- Loại token
    
    -- Trạng thái đồng bộ
    syncStatus VARCHAR(50) DEFAULT 'inactive', -- active, inactive, error, syncing, pending
    lastSyncedAt TIMESTAMP, -- Thời gian đồng bộ cuối
    lastSyncError TEXT, -- Lỗi đồng bộ cuối cùng
    syncErrorCount INTEGER DEFAULT 0, -- Số lần lỗi đồng bộ
    
    -- Cài đặt và cấu hình
    settings JSONB, -- Cài đặt tích hợp
    syncPreferences JSONB, -- Tùy chọn đồng bộ
    dataSharing JSONB, -- Cài đặt chia sẻ dữ liệu
    
    -- Trạng thái hoạt động
    isActive BOOLEAN DEFAULT true,
    isVerified BOOLEAN DEFAULT false, -- Xác minh kết nối
    verifiedAt TIMESTAMP, -- Thời gian xác minh
    
    -- Quản lý
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, integrationId)
);
```



### 11. Bảng Integration_Logs (Lịch sử đồng bộ tích hợp)
```sql
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integrationId UUID REFERENCES integrations(id) ON DELETE CASCADE,
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Thông tin đồng bộ
    syncType VARCHAR(50) NOT NULL, -- oauth, webhook, cron, manual
    syncStatus VARCHAR(50) NOT NULL, -- success, failed, partial
    syncDirection VARCHAR(50) NOT NULL, -- inbound, outbound, bidirectional
    
    -- Dữ liệu đồng bộ
    dataType VARCHAR(100), -- activities, profile, achievements, etc.
    recordCount INTEGER DEFAULT 0, -- Số bản ghi được xử lý
    successCount INTEGER DEFAULT 0, -- Số bản ghi thành công
    errorCount INTEGER DEFAULT 0, -- Số bản ghi lỗi
    
    -- Thông tin lỗi
    errorMessage TEXT, -- Thông báo lỗi
    errorDetails JSONB, -- Chi tiết lỗi
    retryCount INTEGER DEFAULT 0, -- Số lần thử lại
    
    -- Metadata
    startedAt TIMESTAMP NOT NULL, -- Thời gian bắt đầu
    completedAt TIMESTAMP, -- Thời gian hoàn thành
    duration INTEGER, -- Thời gian thực hiện (seconds)
    
    -- Quản lý
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```



### 13. Bảng Notifications (Thông báo)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notificationCode VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- achievement, event, race, club, system
    status VARCHAR(50) DEFAULT 'unread',
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    channel VARCHAR(50) DEFAULT 'in_app', -- in_app, email, push, sms
    recipientId UUID REFERENCES users(id) ON DELETE CASCADE,
    senderId UUID REFERENCES users(id),
    clubId UUID REFERENCES clubs(id),
    relatedObjectId UUID, -- ID của đối tượng liên quan
    relatedObjectType VARCHAR(50), -- Loại đối tượng
    data JSONB, -- Dữ liệu bổ sung
    sentAt TIMESTAMP,
    deliveredAt TIMESTAMP,
    readAt TIMESTAMP,
    expiresAt TIMESTAMP,
    error TEXT,
    retryCount INTEGER DEFAULT 0,
    nextRetryAt TIMESTAMP,
    settings JSONB,
    notes TEXT,
    tags TEXT[],
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 13. Bảng Payments (Thanh toán)
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paymentCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- registration, membership, donation
    status VARCHAR(50) DEFAULT 'pending',
    method VARCHAR(50) NOT NULL, -- vnpay, momo, zalopay, bank_transfer
    currency VARCHAR(3) DEFAULT 'VND',
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    totalAmount DECIMAL(15,2) NOT NULL,
    payerId UUID REFERENCES users(id),
    payeeId UUID REFERENCES users(id),
    clubId UUID REFERENCES clubs(id),
    relatedObjectId UUID, -- ID của đối tượng liên quan
    relatedObjectType VARCHAR(50), -- Loại đối tượng
    externalTransactionId VARCHAR(100), -- ID giao dịch từ gateway
    externalData JSONB, -- Dữ liệu từ gateway
    startedAt TIMESTAMP,
    completedAt TIMESTAMP,
    expiresAt TIMESTAMP,
    cancelledAt TIMESTAMP,
    refundedAt TIMESTAMP,
    reason TEXT,
    notes TEXT,
    metadata JSONB,
    tags TEXT[],
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14. Bảng Analytics (Phân tích dữ liệu)
```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analyticsCode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- user_stats, club_stats, activity_stats, achievement_stats
    period VARCHAR(50) NOT NULL, -- daily, weekly, monthly, yearly
    status VARCHAR(50) DEFAULT 'active',
    clubId UUID REFERENCES clubs(id),
    createdBy UUID REFERENCES users(id),
    startDate TIMESTAMP,
    endDate TIMESTAMP,
    lastGeneratedAt TIMESTAMP,
    lastUpdatedAt TIMESTAMP,
    data JSONB, -- Dữ liệu phân tích
    configuration JSONB,
    settings JSONB,
    error TEXT,
    lastErrorAt TIMESTAMP,
    notes TEXT,
    tags TEXT[],
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 15. Bảng Social (Tương tác xã hội)
```sql
CREATE TABLE social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    socialCode VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- post, comment, like, share
    status VARCHAR(50) DEFAULT 'active',
    visibility VARCHAR(50) DEFAULT 'club',
    authorId UUID REFERENCES users(id),
    clubId UUID REFERENCES clubs(id),
    parentId UUID, -- ID của bài viết gốc (cho comment, like, share)
    parentType VARCHAR(50), -- Loại đối tượng gốc
    title VARCHAR(255),
    content TEXT,
    images TEXT[],
    videos TEXT[],
    links TEXT[],
    location TEXT,
    hashtags TEXT[],
    mentions TEXT[],
    likeCount INTEGER DEFAULT 0,
    commentCount INTEGER DEFAULT 0,
    shareCount INTEGER DEFAULT 0,
    viewCount INTEGER DEFAULT 0,
    data JSONB,
    settings JSONB,
    notes TEXT,
    tags TEXT[],
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 16. Bảng User_Settings (Cài đặt người dùng)
```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    settingType VARCHAR(50) NOT NULL, -- 'notification', 'security', 'privacy', 'preference'
    settingKey VARCHAR(100) NOT NULL, -- 'email_notifications', 'two_factor_auth', 'profile_visibility'
    settingValue JSONB NOT NULL, -- Giá trị cài đặt
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, settingType, settingKey)
);
```

### 17. Bảng Media (Quản lý file, hình ảnh)
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mediaCode VARCHAR(20) UNIQUE NOT NULL,
    originalName VARCHAR(255) NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- image, video, document, audio
    status VARCHAR(50) DEFAULT 'active',
    visibility VARCHAR(50) DEFAULT 'private',
    uploadedBy UUID REFERENCES users(id),
    clubId UUID REFERENCES clubs(id),
    relatedObjectId UUID, -- ID của đối tượng liên quan
    relatedObjectType VARCHAR(50), -- Loại đối tượng
    fileSize BIGINT, -- bytes
    mimeType VARCHAR(100),
    filePath TEXT,
    url TEXT,
    thumbnailUrl TEXT,
    previewUrl TEXT,
    width INTEGER, -- pixels
    height INTEGER, -- pixels
    duration INTEGER, -- seconds
    bitrate INTEGER, -- kbps
    fps INTEGER, -- frames per second
    metadata JSONB,
    processing JSONB,
    settings JSONB,
    notes TEXT,
    tags TEXT[],
    viewCount INTEGER DEFAULT 0,
    downloadCount INTEGER DEFAULT 0,
    isDeleted BOOLEAN DEFAULT false,
    deletedAt TIMESTAMP,
    deletedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

### Indexes cho hiệu suất truy vấn
```sql
-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_deleted ON users(isDeleted);
CREATE INDEX idx_users_status ON users(status);

-- Clubs
CREATE INDEX idx_clubs_code ON clubs(code);
CREATE INDEX idx_clubs_is_deleted ON clubs(isDeleted);
CREATE INDEX idx_clubs_is_active ON clubs(isActive);

-- Activities
CREATE INDEX idx_activities_user_id ON activities(userId);
CREATE INDEX idx_activities_club_id ON activities(clubId);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_start_time ON activities(startTime);
CREATE INDEX idx_activities_source ON activities(source);
CREATE INDEX idx_activities_external_id ON activities(externalId);
CREATE INDEX idx_activities_is_deleted ON activities(isDeleted);

-- Events
CREATE INDEX idx_events_club_id ON events(clubId);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(startDate);
CREATE INDEX idx_events_is_deleted ON events(isDeleted);

-- Challenges
CREATE INDEX idx_challenges_event_id ON challenges(eventId);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_start_date ON challenges(startDate);
CREATE INDEX idx_challenges_is_deleted ON challenges(isDeleted);

-- Challenge Participants
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challengeId);
CREATE INDEX idx_challenge_participants_user_id ON challenge_participants(userId);
CREATE INDEX idx_challenge_participants_status ON challenge_participants(status);
CREATE INDEX idx_challenge_participants_is_deleted ON challenge_participants(isDeleted);

-- Challenge Leaderboards
CREATE INDEX idx_challenge_leaderboards_challenge_id ON challenge_leaderboards(challengeId);
CREATE INDEX idx_challenge_leaderboards_user_id ON challenge_leaderboards(userId);
CREATE INDEX idx_challenge_leaderboards_rank ON challenge_leaderboards(rank);
CREATE INDEX idx_challenge_leaderboards_is_deleted ON challenge_leaderboards(isDeleted);

-- Races
CREATE INDEX idx_races_club_id ON races(clubId);
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_races_start_date ON races(startDate);
CREATE INDEX idx_races_is_deleted ON races(isDeleted);

-- Achievements
CREATE INDEX idx_achievements_club_id ON achievements(clubId);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_achievements_tier ON achievements(tier);
CREATE INDEX idx_achievements_is_deleted ON achievements(isDeleted);

-- Integrations
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_is_deleted ON integrations(isDeleted);

-- User Integrations
CREATE INDEX idx_user_integrations_user_id ON user_integrations(userId);
CREATE INDEX idx_user_integrations_integration_id ON user_integrations(integrationId);
CREATE INDEX idx_user_integrations_sync_status ON user_integrations(syncStatus);
CREATE INDEX idx_user_integrations_external_user_id ON user_integrations(externalUserId);

-- Integration Logs
CREATE INDEX idx_integration_logs_integration_id ON integration_logs(integrationId);
CREATE INDEX idx_integration_logs_user_id ON integration_logs(userId);
CREATE INDEX idx_integration_logs_sync_type ON integration_logs(syncType);
CREATE INDEX idx_integration_logs_sync_status ON integration_logs(syncStatus);
CREATE INDEX idx_integration_logs_started_at ON integration_logs(startedAt);

-- Notifications
CREATE INDEX idx_notifications_recipient_id ON notifications(recipientId);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_deleted ON notifications(isDeleted);

-- Payments
CREATE INDEX idx_payments_payer_id ON payments(payerId);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_is_deleted ON payments(isDeleted);

-- Analytics
CREATE INDEX idx_analytics_club_id ON analytics(clubId);
CREATE INDEX idx_analytics_type ON analytics(type);
CREATE INDEX idx_analytics_period ON analytics(period);
CREATE INDEX idx_analytics_is_deleted ON analytics(isDeleted);

-- Social
CREATE INDEX idx_social_author_id ON social(authorId);
CREATE INDEX idx_social_club_id ON social(clubId);
CREATE INDEX idx_social_type ON social(type);
CREATE INDEX idx_social_is_deleted ON social(isDeleted);

-- User Settings
CREATE INDEX idx_user_settings_user_id ON user_settings(userId);
CREATE INDEX idx_user_settings_type ON user_settings(settingType);
CREATE INDEX idx_user_settings_key ON user_settings(settingKey);
CREATE INDEX idx_user_settings_active ON user_settings(isActive);

-- Media
CREATE INDEX idx_media_uploaded_by ON media(uploadedBy);
CREATE INDEX idx_media_club_id ON media(clubId);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_is_deleted ON media(isDeleted);
```

## Soft Delete Strategy

### Nguyên tắc xóa mềm
- Tất cả các bảng chính đều có trường `isDeleted`, `deletedAt`, `deletedBy`
- Dữ liệu không bị xóa hoàn toàn mà chỉ đánh dấu đã xóa
- Có thể khôi phục dữ liệu nếu cần thiết
- Các truy vấn mặc định chỉ lấy dữ liệu chưa bị xóa

### Cách sử dụng
```sql
-- Lấy dữ liệu chưa bị xóa
SELECT * FROM users WHERE isDeleted = false;

-- Đánh dấu xóa mềm
UPDATE users SET 
    isDeleted = true, 
    deletedAt = CURRENT_TIMESTAMP, 
    deletedBy = 'user_id_here' 
WHERE id = 'user_id';

-- Khôi phục dữ liệu
UPDATE users SET 
    isDeleted = false, 
    deletedAt = NULL, 
    deletedBy = NULL 
WHERE id = 'user_id';
```

## External Data Sync System

### Hệ thống đồng bộ dữ liệu từ nền tảng bên ngoài
- **Strava**: Đồng bộ hoạt động chạy bộ, quãng đường, thời gian, tốc độ
- **Garmin**: Đồng bộ dữ liệu từ thiết bị Garmin, nhịp tim, GPS
- **Apple Health**: Đồng bộ dữ liệu sức khỏe từ iOS
- **Google Fit**: Đồng bộ dữ liệu từ Android

### Cấu trúc đồng bộ
- Bảng `integrations` lưu thông tin kết nối với nền tảng bên ngoài
- Bảng `user_integrations` lưu thông tin tích hợp của từng người dùng
- Bảng `activities` có trường `source`, `externalId`, `lastSyncedAt`, `syncStatus`
- Hỗ trợ webhook để nhận dữ liệu real-time từ các nền tảng

### Quy trình đồng bộ
1. Người dùng kết nối tài khoản với nền tảng bên ngoài
2. Hệ thống lưu thông tin xác thực vào `user_integrations`
3. Đồng bộ dữ liệu theo lịch trình hoặc qua webhook
4. Lưu dữ liệu vào bảng `activities` với metadata gốc
5. Cập nhật trạng thái đồng bộ và thời gian đồng bộ cuối

## Tổng kết

Hệ thống X-Club được thiết kế với **16 bảng chính** tập trung vào:
- **Quản lý người dùng và câu lạc bộ** (Users, Clubs, Club_Members)
- **Hoạt động chạy bộ** (Activities) với khả năng đồng bộ từ Strava/Garmin
- **Sự kiện và giải chạy** (Events, Races)
- **Thành tích và gamification** (Achievements, User_Achievements)
- **Tích hợp nền tảng bên ngoài** (Integrations, User_Integrations, Integration_Logs)
- **Thông báo và thanh toán** (Notifications, Payments)
- **Phân tích và tương tác xã hội** (Analytics, Social, Media)

Cấu trúc này đảm bảo tính mở rộng, hiệu suất cao và khả năng tích hợp tốt với các nền tảng thể thao bên ngoài.
