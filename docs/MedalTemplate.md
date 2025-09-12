# Medal Template Module

## Tổng quan
Module quản lý mẫu huy chương cho hệ thống thử thách. Cho phép người dùng tạo, chỉnh sửa và quản lý các mẫu huy chương với HTML template và CSS styling.

## Chức năng chính

### 1. Tạo mẫu huy chương
- **Mô tả**: Tạo mẫu huy chương mới với HTML template và CSS styling
- **Input**: Tên, mô tả, loại huy chương, HTML template, CSS styles, biến template
- **Output**: Mẫu huy chương đã được tạo
- **Quy tắc nghiệp vụ**:
  - Chỉ người tạo mới có quyền chỉnh sửa/xóa
  - HTML template phải hợp lệ
  - CSS styles phải hợp lệ
  - Biến template phải được định nghĩa rõ ràng

### 2. Quản lý danh sách mẫu huy chương
- **Mô tả**: Xem danh sách các mẫu huy chương với phân trang và filter
- **Input**: Trang, giới hạn, tìm kiếm, loại, trạng thái
- **Output**: Danh sách mẫu huy chương với thông tin cơ bản
- **Quy tắc nghiệp vụ**:
  - Hiển thị mẫu công khai cho tất cả người dùng
  - Chỉ hiển thị mẫu riêng tư của người tạo

### 3. Xem chi tiết mẫu huy chương
- **Mô tả**: Xem thông tin chi tiết của một mẫu huy chương
- **Input**: ID mẫu huy chương
- **Output**: Thông tin đầy đủ của mẫu huy chương
- **Quy tắc nghiệp vụ**:
  - Kiểm tra quyền truy cập (công khai hoặc của người tạo)

### 4. Cập nhật mẫu huy chương
- **Mô tả**: Chỉnh sửa thông tin mẫu huy chương
- **Input**: ID mẫu huy chương, dữ liệu cập nhật
- **Output**: Mẫu huy chương đã được cập nhật
- **Quy tắc nghiệp vụ**:
  - Chỉ người tạo mới có quyền cập nhật
  - Không thể cập nhật mẫu đã bị xóa

### 5. Xóa mẫu huy chương
- **Mô tả**: Xóa mẫu huy chương khỏi hệ thống
- **Input**: ID mẫu huy chương
- **Output**: Xác nhận xóa thành công
- **Quy tắc nghiệp vụ**:
  - Chỉ người tạo mới có quyền xóa
  - Kiểm tra mẫu có đang được sử dụng không

### 6. Xem trước mẫu huy chương
- **Mô tả**: Xem trước mẫu huy chương với dữ liệu mẫu
- **Input**: ID mẫu huy chương, dữ liệu mẫu
- **Output**: HTML đã render với dữ liệu mẫu
- **Quy tắc nghiệp vụ**:
  - Thay thế các biến trong template bằng dữ liệu mẫu
  - Tạo HTML hoàn chỉnh để xem trước

## Các loại huy chương
- **Gold**: Huy chương vàng (hạng nhất)
- **Silver**: Huy chương bạc (hạng nhì)
- **Bronze**: Huy chương đồng (hạng ba)
- **Participation**: Huy chương tham gia
- **Special**: Huy chương đặc biệt

## Biến template
- **participant_name**: Tên người tham gia
- **team_name**: Tên đội
- **challenge_name**: Tên thử thách
- **achievement**: Thành tích
- **rank**: Hạng
- **score**: Điểm số
- **distance**: Khoảng cách
- **time**: Thời gian
- **completion_date**: Ngày hoàn thành

## Trạng thái
- **isActive**: Mẫu có hoạt động không
- **isPublic**: Mẫu có công khai không

## API Endpoints
- `POST /api/medal-templates` - Tạo mẫu huy chương
- `GET /api/medal-templates` - Lấy danh sách mẫu huy chương
- `GET /api/medal-templates/:id` - Lấy chi tiết mẫu huy chương
- `PATCH /api/medal-templates/:id` - Cập nhật mẫu huy chương
- `DELETE /api/medal-templates/:id` - Xóa mẫu huy chương
- `POST /api/medal-templates/:id/preview` - Xem trước mẫu huy chương
