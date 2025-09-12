# GiayChungNhan Template Module

## Tổng quan
Module quản lý mẫu giấy chứng nhận cho hệ thống thử thách. Cho phép người dùng tạo, chỉnh sửa và quản lý các mẫu giấy chứng nhận với HTML template và CSS styling.

## Chức năng chính

### 1. Tạo mẫu giấy chứng nhận
- **Mô tả**: Tạo mẫu giấy chứng nhận mới với HTML template và CSS styling
- **Input**: Tên, mô tả, loại giấy chứng nhận, HTML template, CSS styles, hình ảnh
- **Output**: Mẫu giấy chứng nhận đã được tạo
- **Quy tắc nghiệp vụ**:
  - Chỉ người tạo mới có quyền chỉnh sửa/xóa
  - HTML template phải hợp lệ
  - CSS styles phải hợp lệ
  - Hỗ trợ hình nền, logo, chữ ký

### 2. Quản lý danh sách mẫu giấy chứng nhận
- **Mô tả**: Xem danh sách các mẫu giấy chứng nhận với phân trang và filter
- **Input**: Trang, giới hạn, tìm kiếm, loại, trạng thái
- **Output**: Danh sách mẫu giấy chứng nhận với thông tin cơ bản
- **Quy tắc nghiệp vụ**:
  - Hiển thị mẫu công khai cho tất cả người dùng
  - Chỉ hiển thị mẫu riêng tư của người tạo

### 3. Xem chi tiết mẫu giấy chứng nhận
- **Mô tả**: Xem thông tin chi tiết của một mẫu giấy chứng nhận
- **Input**: ID mẫu giấy chứng nhận
- **Output**: Thông tin đầy đủ của mẫu giấy chứng nhận
- **Quy tắc nghiệp vụ**:
  - Kiểm tra quyền truy cập (công khai hoặc của người tạo)

### 4. Cập nhật mẫu giấy chứng nhận
- **Mô tả**: Chỉnh sửa thông tin mẫu giấy chứng nhận
- **Input**: ID mẫu giấy chứng nhận, dữ liệu cập nhật
- **Output**: Mẫu giấy chứng nhận đã được cập nhật
- **Quy tắc nghiệp vụ**:
  - Chỉ người tạo mới có quyền cập nhật
  - Không thể cập nhật mẫu đã bị xóa

### 5. Xóa mẫu giấy chứng nhận
- **Mô tả**: Xóa mẫu giấy chứng nhận khỏi hệ thống
- **Input**: ID mẫu giấy chứng nhận
- **Output**: Xác nhận xóa thành công
- **Quy tắc nghiệp vụ**:
  - Chỉ người tạo mới có quyền xóa
  - Kiểm tra mẫu có đang được sử dụng không

### 6. Xem trước mẫu giấy chứng nhận
- **Mô tả**: Xem trước mẫu giấy chứng nhận với dữ liệu mẫu
- **Input**: ID mẫu giấy chứng nhận, dữ liệu mẫu
- **Output**: HTML đã render với dữ liệu mẫu
- **Quy tắc nghiệp vụ**:
  - Thay thế các biến trong template bằng dữ liệu mẫu
  - Tạo HTML hoàn chỉnh để xem trước

## Các loại giấy chứng nhận
- **Completion**: Chứng chỉ hoàn thành
- **Achievement**: Chứng chỉ thành tích
- **Participation**: Chứng chỉ tham gia
- **Winner**: Chứng chỉ người chiến thắng

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

## Hình ảnh hỗ trợ
- **backgroundImage**: Hình nền giấy chứng nhận
- **logoImage**: Logo tổ chức
- **signatureImage**: Chữ ký xác nhận

## Trạng thái
- **isActive**: Mẫu có hoạt động không
- **isPublic**: Mẫu có công khai không

## API Endpoints
- `POST /api/certificate-templates` - Tạo mẫu giấy chứng nhận
- `GET /api/certificate-templates` - Lấy danh sách mẫu giấy chứng nhận
- `GET /api/certificate-templates/:id` - Lấy chi tiết mẫu giấy chứng nhận
- `PATCH /api/certificate-templates/:id` - Cập nhật mẫu giấy chứng nhận
- `DELETE /api/certificate-templates/:id` - Xóa mẫu giấy chứng nhận
- `POST /api/certificate-templates/:id/preview` - Xem trước mẫu giấy chứng nhận
