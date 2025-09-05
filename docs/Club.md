# Club Module - Quản lý câu lạc bộ chạy bộ

## **1. Tổng quan module**

### **1.1 Mục đích**
Module Club quản lý **thông tin cốt lõi** của các câu lạc bộ chạy bộ, bao gồm thông tin cơ bản, thành viên, vai trò và thiết lập cơ bản.

### **1.2 Phạm vi**
- **Quản lý thông tin CLB**: Tạo, sửa, xóa, tìm kiếm câu lạc bộ
- **Quản lý thành viên**: Thêm/xóa thành viên, phân quyền vai trò
- **Quản lý trạng thái**: Active, inactive, suspended, pending
- **Hệ thống quyền**: Phân quyền chi tiết cho các loại hoạt động
- **Không quản lý**: Sự kiện, hoạt động, tài chính chi tiết

---

## **2. Chức năng chính**

### **2.1 Quản lý câu lạc bộ**
- **CRUD Operations**
  - Tạo câu lạc bộ mới (tự động tạo Admin đầu tiên)
  - Cập nhật thông tin câu lạc bộ
  - Xóa câu lạc bộ (soft delete)
  - Tìm kiếm và lọc câu lạc bộ

- **Quản lý thành viên**
  - Thêm/xóa thành viên
  - Phân quyền vai trò: admin, moderator, member
  - Quản lý trạng thái thành viên
  - Chuyển giao quyền admin
  - Gỡ quyền admin

### **2.2 Hệ thống quyền chi tiết**
- **Quyền theo vai trò**:
  - **Admin**: Tất cả quyền
  - **Moderator**: Quản lý hoạt động, thành viên (hạn chế)
  - **Member**: Tham gia hoạt động, xem thông tin

- **Quyền theo loại hoạt động**:
  - **Event & Challenge**: Chỉ thành viên CLB mới tham gia được
  - **Race**: Public toàn hệ thống, ai cũng tham gia được

### **2.3 Tìm kiếm và lọc**
- **Tìm kiếm theo tên**
- **Lọc theo địa điểm**
- **Lọc theo trạng thái**
- **Lọc theo loại CLB**
- **Phân trang kết quả**

### **2.4 Thống kê câu lạc bộ**
- **Tổng số thành viên**
- **Số thành viên theo vai trò**
- **Số sự kiện đã tổ chức**
- **Số hoạt động trong tháng**

---

## **3. Cấu trúc dữ liệu**

### **3.1 Entity chính**

#### **Club Entity**
```typescript
interface Club {
  id: string;                    // UUID duy nhất
  clubCode: string;              // Mã CLB (unique, length: 20)
  name: string;                  // Tên câu lạc bộ (length: 255)
  shortName?: string;            // Tên viết tắt (length: 50)
  description?: string;          // Mô tả (text)
  type: ClubType;                // Loại CLB: RUNNING, MULTISPORT, FITNESS, SOCIAL, COMPETITIVE, CHARITY
  status: ClubStatus;            // Trạng thái: ACTIVE, INACTIVE, SUSPENDED, PENDING
  logoUrl?: string;              // URL logo
  coverImageUrl?: string;        // URL ảnh bìa
  website?: string;              // Website chính thức
  email?: string;                // Email liên hệ
  phone?: string;                // Số điện thoại liên hệ
  address?: string;              // Địa chỉ trụ sở (text)
  city?: string;                 // Thành phố (length: 100)
  state?: string;                // Tỉnh/Thành phố (length: 100)
  country?: string;              // Quốc gia (length: 100)
  postalCode?: string;           // Mã bưu điện (length: 20)
  latitude?: number;             // Vĩ độ (decimal 10,7)
  longitude?: number;            // Kinh độ (decimal 10,7)
  foundedAt?: Date;              // Thời gian thành lập
  maxMembers?: number;           // Số lượng thành viên tối đa
  monthlyFee?: number;           // Phí thành viên hàng tháng (VND)
  yearlyFee?: number;            // Phí thành viên hàng năm (VND)
  rules?: string;                // Quy tắc câu lạc bộ (text)
  schedule?: string;             // Lịch hoạt động (text)
  contactInfo?: any;             // Thông tin liên hệ khác (jsonb)
  socialMedia?: any;             // Mạng xã hội (jsonb)
  settings?: any;                // Cài đặt câu lạc bộ (jsonb)
  isPublic: boolean;             // Công khai hay riêng tư
  allowNewMembers: boolean;      // Cho phép đăng ký thành viên mới
  requireApproval: boolean;      // Yêu cầu phê duyệt thành viên mới
  
  // Soft delete
  isDeleted: boolean;            // Đã xóa chưa
  deletedAt?: Date;              // Thời gian xóa
  deletedBy?: string;            // Người xóa
  
  // Timestamps
  createdAt: Date;               // Thời gian tạo
  updatedAt: Date;               // Thời gian cập nhật
  
  // Relationships
  members: ClubMember[];         // Danh sách thành viên
  
  // Virtual properties
  memberCount: number;           // Số lượng thành viên active
  adminCount: number;            // Số lượng admin
  moderatorCount: number;        // Số lượng moderator
}
```

#### **ClubMember Entity**
```typescript
interface ClubMember {
  id: string;                    // UUID duy nhất
  clubId: string;                // ID câu lạc bộ (FK)
  userId: string;                // ID người dùng (FK)
  role: MemberRole;              // Vai trò: ADMIN, MODERATOR, MEMBER
  status: MemberStatus;          // Trạng thái: ACTIVE, INACTIVE, SUSPENDED, PENDING
  joinedAt: Date;                // Thời gian tham gia
  leftAt?: Date;                 // Thời gian rời CLB
  leaveReason?: string;          // Lý do rời CLB
  notes?: string;                // Ghi chú
  metadata?: any;                // Thông tin bổ sung
  
  // Relationships
  club: Club;                    // Thông tin CLB
  user: User;                    // Thông tin người dùng
}
```

#### **Enums**

**ClubType**
```typescript
enum ClubType {
  RUNNING = 'running',           // Chạy bộ
  MULTISPORT = 'multisport',     // Đa môn thể thao
  FITNESS = 'fitness',           // Thể hình
  SOCIAL = 'social',             // Giao lưu
  COMPETITIVE = 'competitive',   // Thi đấu
  CHARITY = 'charity'            // Từ thiện
}
```

**ClubStatus**
```typescript
enum ClubStatus {
  ACTIVE = 'active',             // Hoạt động
  INACTIVE = 'inactive',         // Không hoạt động
  SUSPENDED = 'suspended',       // Tạm ngưng
  PENDING = 'pending'            // Chờ duyệt
}
```

**MemberRole**
```typescript
enum MemberRole {
  ADMIN = 'admin',               // Quản trị viên (có tất cả quyền)
  MODERATOR = 'moderator',       // Điều hành viên (quyền hạn chế)
  MEMBER = 'member'              // Thành viên thường (quyền cơ bản)
}
```

**MemberStatus**
```typescript
enum MemberStatus {
  ACTIVE = 'active',             // Hoạt động
  INACTIVE = 'inactive',         // Không hoạt động
  SUSPENDED = 'suspended',       // Tạm ngưng
  PENDING = 'pending'            // Chờ phê duyệt
}
```

---

## **4. Hệ thống quyền**

### **4.1 Quyền theo vai trò**

#### **Admin (Quản trị viên)**
- **Quản lý CLB**: Sửa/xóa thông tin, thay đổi trạng thái
- **Quản lý thành viên**: Thêm/xóa/sửa thành viên, thay đổi vai trò
- **Tạo hoạt động**: Tạo Event, Challenge, Race
- **Quản lý hoạt động**: Sửa/xóa tất cả hoạt động
- **Tham gia hoạt động**: Tham gia/rời khỏi tất cả hoạt động
- **Xem thông tin**: Xem tất cả thông tin và thống kê

#### **Moderator (Điều hành viên)**
- **Quản lý thành viên**: Xem danh sách, quản lý hạn chế
- **Quản lý hoạt động**: Sửa/xóa Event, Challenge, Race
- **Tham gia hoạt động**: Tham gia/rời khỏi tất cả hoạt động
- **Xem thông tin**: Xem hoạt động và thống kê
- **Không có quyền**: Tạo hoạt động mới, quản lý CLB

#### **Member (Thành viên thường)**
- **Tham gia hoạt động**: Tham gia/rời khỏi Event, Challenge, Race
- **Xem thông tin**: Xem hoạt động và thống kê
- **Rời CLB**: Có thể rời khỏi câu lạc bộ
- **Không có quyền**: Tạo/quản lý hoạt động, quản lý thành viên

### **4.2 Quyền theo loại hoạt động**

#### **Event & Challenge (Private theo CLB)**
- **Tạo**: Chỉ Admin mới tạo được
- **Tham gia**: Chỉ thành viên CLB mới tham gia được
- **Quản lý**: Admin và Moderator
- **Xem**: Chỉ thành viên CLB

#### **Race (Public toàn hệ thống)**
- **Tạo**: Chỉ Admin CLB mới tạo được
- **Tham gia**: Tất cả người dùng hệ thống đều tham gia được
- **Quản lý**: Admin và Moderator của CLB tạo Race
- **Xem**: Tất cả người dùng hệ thống

### **4.3 Quy tắc đặc biệt**
- **Người tạo CLB**: Tự động trở thành Admin đầu tiên
- **Race public**: Không cần là thành viên CLB cũng tham gia được
- **Quyền tạo Race**: Chỉ Admin CLB mới tạo được (dù Race là public)

---

## **5. API Endpoints**

### **5.1 Quản lý CLB**
- `POST /clubs` - Tạo CLB mới
- `GET /clubs` - Lấy danh sách CLB (có filter và phân trang)
- `GET /clubs/:id` - Lấy thông tin CLB theo ID
- `GET /clubs/code/:clubCode` - Lấy CLB theo mã
- `PATCH /clubs/:id` - Cập nhật thông tin CLB
- `DELETE /clubs/:id` - Xóa CLB (soft delete)
- `PATCH /clubs/:id/status` - Thay đổi trạng thái CLB

### **5.2 Quản lý thành viên**
- `POST /clubs/:clubId/members` - Thêm thành viên mới
- `GET /clubs/:clubId/members` - Lấy danh sách thành viên
- `PUT /clubs/:clubId/members/:userId/role` - Cập nhật vai trò
- `PUT /clubs/:clubId/members/:userId/status` - Cập nhật trạng thái
- `POST /clubs/:clubId/members/transfer-admin` - Chuyển giao quyền admin
- `PUT /clubs/:clubId/members/:userId/remove-admin` - Gỡ quyền admin
- `DELETE /clubs/:clubId/members/:userId` - Xóa thành viên
- `GET /clubs/:clubId/members/my-role` - Lấy vai trò của mình

### **5.3 Tìm kiếm và thống kê**
- `GET /clubs/search?q=keyword` - Tìm kiếm CLB
- `GET /clubs/city/:city` - Lấy CLB theo thành phố
- `GET /clubs/type/:type` - Lấy CLB theo loại
- `GET /clubs/stats` - Lấy thống kê CLB

---

## **6. Business Rules**

### **6.1 Quy tắc tạo CLB**
- Người tạo CLB tự động trở thành Admin đầu tiên
- CLB mới có trạng thái PENDING (chờ duyệt)
- Mã CLB được tạo tự động theo format: CLB0001, CLB0002,...
- CLB mặc định là public và cho phép đăng ký thành viên mới

### **6.2 Quy tắc quản lý thành viên**
- Admin có thể thêm/xóa/sửa tất cả thành viên
- Moderator có thể quản lý thành viên hạn chế
- Thành viên mới có thể cần phê duyệt tùy theo cài đặt CLB
- Không thể xóa Admin cuối cùng của CLB

### **6.3 Quy tắc phân quyền**
- **Event & Challenge**: Chỉ thành viên CLB mới tham gia được
- **Race**: Public toàn hệ thống, ai cũng tham gia được
- **Tạo hoạt động**: Chỉ Admin mới tạo được
- **Quản lý hoạt động**: Admin và Moderator

### **6.4 Quy tắc chuyển giao quyền**
- Admin có thể chuyển giao quyền admin cho thành viên khác
- Admin có thể gỡ quyền admin của thành viên khác
- Không thể gỡ quyền admin của chính mình
- Phải có ít nhất 1 Admin trong CLB

---

## **7. DTOs và Validation**

### **7.1 CreateClubDto**
```typescript
interface CreateClubDto {
  name: string;                  // Bắt buộc, tối đa 255 ký tự
  shortName?: string;            // Tối đa 50 ký tự
  description?: string;          // Text
  type: ClubType;                // Bắt buộc
  logoUrl?: string;              // URL hợp lệ
  coverImageUrl?: string;        // URL hợp lệ
  website?: string;              // URL hợp lệ
  email?: string;                // Email hợp lệ
  phone?: string;                // Số điện thoại
  address?: string;              // Text
  city?: string;                 // Tối đa 100 ký tự
  state?: string;                // Tối đa 100 ký tự
  country?: string;              // Tối đa 100 ký tự
  postalCode?: string;           // Tối đa 20 ký tự
  latitude?: number;             // Số thập phân
  longitude?: number;            // Số thập phân
  foundedAt?: string;            // ISO date string
  maxMembers?: number;           // Số nguyên dương
  monthlyFee?: number;           // Số thập phân
  yearlyFee?: number;            // Số thập phân
  rules?: string;                // Text
  schedule?: string;             // Text
  contactInfo?: any;             // JSON object
  socialMedia?: any;             // JSON object
  settings?: any;                // JSON object
  isPublic?: boolean;            // Boolean, mặc định true
  allowNewMembers?: boolean;     // Boolean, mặc định true
  requireApproval?: boolean;     // Boolean, mặc định false
}
```

### **7.2 ManageMemberDto**
```typescript
interface AddMemberDto {
  userId: string;                // UUID hợp lệ
  role?: MemberRole;             // Mặc định MEMBER
  notes?: string;                // Ghi chú
}

interface UpdateMemberRoleDto {
  role: MemberRole;              // Bắt buộc
}

interface UpdateMemberStatusDto {
  status: MemberStatus;          // Bắt buộc
}

interface TransferAdminDto {
  newAdminUserId: string;        // UUID hợp lệ
}

interface RemoveMemberDto {
  reason?: string;                // Lý do xóa
}
```

---

## **8. Error Handling**

### **8.1 HTTP Status Codes**
- `200` - Thành công
- `201` - Tạo thành công
- `400` - Dữ liệu không hợp lệ
- `401` - Chưa đăng nhập
- `403` - Không có quyền
- `404` - Không tìm thấy
- `409` - Xung đột dữ liệu
- `500` - Lỗi server

### **8.2 Error Messages**
- **Validation errors**: Chi tiết các trường không hợp lệ
- **Permission errors**: Lý do không có quyền thực hiện
- **Business logic errors**: Lý do không thể thực hiện theo quy tắc nghiệp vụ
- **System errors**: Thông báo lỗi chung cho lỗi hệ thống

---

## **9. Testing**

### **9.1 Unit Tests**
- **Service tests**: Kiểm tra logic nghiệp vụ
- **Controller tests**: Kiểm tra API endpoints
- **Entity tests**: Kiểm tra validation và relationships
- **Permission tests**: Kiểm tra hệ thống quyền

### **9.2 Integration Tests**
- **Database tests**: Kiểm tra tương tác với database
- **API tests**: Kiểm tra toàn bộ flow API
- **Permission flow tests**: Kiểm tra luồng phân quyền

### **9.3 Test Coverage**
- **Code coverage**: Tối thiểu 80%
- **Business logic**: 100% các quy tắc nghiệp vụ
- **Error scenarios**: Tất cả các trường hợp lỗi
- **Permission scenarios**: Tất cả các trường hợp quyền

---

## **10. Performance & Security**

### **10.1 Performance**
- **Database indexing**: Index trên các trường tìm kiếm
- **Query optimization**: Sử dụng query builder tối ưu
- **Pagination**: Phân trang cho danh sách lớn
- **Caching**: Cache thông tin CLB thường xuyên truy cập

### **10.2 Security**
- **Authentication**: JWT token bắt buộc
- **Authorization**: Kiểm tra quyền chi tiết
- **Input validation**: Validate tất cả input
- **SQL injection**: Sử dụng TypeORM để tránh SQL injection
- **Rate limiting**: Giới hạn số request

---

## **11. Monitoring & Logging**

### **11.1 Logging**
- **User actions**: Log tất cả hành động của user
- **Permission checks**: Log các lần kiểm tra quyền
- **Error logging**: Log chi tiết các lỗi
- **Performance logging**: Log thời gian thực hiện các operation

### **11.2 Monitoring**
- **API performance**: Monitor thời gian response
- **Database performance**: Monitor query performance
- **Error rates**: Monitor tỷ lệ lỗi
- **User activity**: Monitor hoạt động của user

---

## **12. Future Enhancements**

### **12.1 Tính năng mở rộng**
- **Club categories**: Phân loại CLB chi tiết hơn
- **Club templates**: Template tạo CLB nhanh
- **Advanced permissions**: Phân quyền chi tiết hơn
- **Club analytics**: Thống kê chi tiết hơn

### **12.2 Tích hợp**
- **Social media**: Tích hợp với mạng xã hội
- **Payment gateway**: Tích hợp thanh toán phí thành viên
- **Notification system**: Hệ thống thông báo
- **Mobile app**: Ứng dụng mobile

---

## **13. Kết luận**

Module Club cung cấp **nền tảng cốt lõi** cho hệ thống X-Club, quản lý thông tin câu lạc bộ và thành viên với hệ thống phân quyền chi tiết. Module này đảm bảo:

- **Tính bảo mật**: Phân quyền rõ ràng theo vai trò
- **Tính linh hoạt**: Hỗ trợ cả hoạt động private và public
- **Tính mở rộng**: Dễ dàng thêm tính năng mới
- **Tính ổn định**: Xử lý lỗi và validation đầy đủ

Module này là **cơ sở** để các module khác (Event, Challenge, Race) xây dựng trên đó.
