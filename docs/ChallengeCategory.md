# Challenge Category Module

## Tổng quan
Module quản lý danh mục thử thách. Cho phép tạo các danh mục khác nhau cho một thử thách, giúp phân loại và tổ chức các loại tham gia khác nhau.

## Chức năng chính

### 1. Tạo danh mục thử thách
- **Mô tả**: Tạo danh mục mới cho một thử thách
- **Input**: Tên, mô tả, loại, đơn vị, giá trị min/max
- **Output**: Danh mục thử thách đã được tạo
- **Quy tắc nghiệp vụ**:
  - Mỗi thử thách có thể có nhiều danh mục
  - Danh mục phải thuộc về một thử thách cụ thể
  - Đơn vị đo lường phải được định nghĩa rõ ràng

### 2. Quản lý danh sách danh mục
- **Mô tả**: Xem danh sách các danh mục của một thử thách
- **Input**: ID thử thách, trang, giới hạn, filter
- **Output**: Danh sách danh mục với thông tin cơ bản
- **Quy tắc nghiệp vụ**:
  - Chỉ hiển thị danh mục của thử thách được chỉ định
  - Sắp xếp theo thứ tự sortOrder

### 3. Xem chi tiết danh mục
- **Mô tả**: Xem thông tin chi tiết của một danh mục
- **Input**: ID thử thách, ID danh mục
- **Output**: Thông tin đầy đủ của danh mục
- **Quy tắc nghiệp vụ**:
  - Kiểm tra danh mục thuộc về thử thách đúng

### 4. Cập nhật danh mục thử thách
- **Mô tả**: Chỉnh sửa thông tin danh mục
- **Input**: ID thử thách, ID danh mục, dữ liệu cập nhật
- **Output**: Danh mục đã được cập nhật
- **Quy tắc nghiệp vụ**:
  - Không thể cập nhật danh mục đã bị xóa
  - Giá trị min/max phải hợp lệ

### 5. Xóa danh mục thử thách
- **Mô tả**: Xóa danh mục khỏi thử thách
- **Input**: ID thử thách, ID danh mục
- **Output**: Xác nhận xóa thành công
- **Quy tắc nghiệp vụ**:
  - Kiểm tra danh mục có đang được sử dụng không
  - Không thể xóa danh mục bắt buộc

## Các loại danh mục
- **Distance**: Danh mục khoảng cách (km, miles)
- **Time**: Danh mục thời gian (hours, minutes)
- **Repetition**: Danh mục lặp lại (reps, sets)
- **Custom**: Danh mục tùy chỉnh

## Thông tin danh mục
- **name**: Tên danh mục
- **description**: Mô tả chi tiết
- **type**: Loại danh mục
- **unit**: Đơn vị đo lường
- **minValue**: Giá trị tối thiểu
- **maxValue**: Giá trị tối đa
- **isRequired**: Danh mục bắt buộc
- **isActive**: Danh mục hoạt động
- **sortOrder**: Thứ tự sắp xếp

## Danh mục mẫu
### Distance Categories
- **5K**: 5 km
- **10K**: 10 km
- **Half Marathon**: 21.1 km
- **Marathon**: 42.2 km
- **Ultra Marathon**: 100+ km

### Time Categories
- **1 Hour**: 1 giờ
- **2 Hours**: 2 giờ
- **4 Hours**: 4 giờ
- **8 Hours**: 8 giờ
- **12 Hours**: 12 giờ
- **24 Hours**: 24 giờ

### Repetition Categories
- **Push-ups**: Hít đất
- **Sit-ups**: Gập bụng
- **Squats**: Squat
- **Burpees**: Burpee
- **Jumping Jacks**: Nhảy dang tay

## Quy tắc nghiệp vụ
- Mỗi thử thách có thể có nhiều danh mục
- Danh mục bắt buộc không thể xóa
- Giá trị min/max phải hợp lệ
- Đơn vị đo lường phải nhất quán
- Thứ tự sắp xếp theo sortOrder

## API Endpoints
- `POST /api/challenges/:challengeId/categories` - Tạo danh mục thử thách
- `GET /api/challenges/:challengeId/categories` - Lấy danh sách danh mục
- `GET /api/challenges/:challengeId/categories/:id` - Lấy chi tiết danh mục
- `PATCH /api/challenges/:challengeId/categories/:id` - Cập nhật danh mục
- `DELETE /api/challenges/:challengeId/categories/:id` - Xóa danh mục
