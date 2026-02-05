# Car Rental Management System - UI với Handlebars

Hệ thống quản lý cho thuê xe với giao diện người dùng sử dụng Handlebars template engine.

## Tính năng

### 1. Dashboard
- Tổng quan thống kê hệ thống
- Hiển thị số lượng xe, người dùng, booking
- Danh sách booking gần đây
- Quick actions

### 2. Car Management (Quản lý Xe)
- **Danh sách xe**: Xem tất cả xe với phân trang
- **Thêm xe mới**: Form nhập thông tin xe chi tiết
- **Chỉnh sửa xe**: Cập nhật thông tin xe
- **Chi tiết xe**: Xem thông tin đầy đủ và lịch sử booking
- **Xóa xe**: Xóa xe khỏi hệ thống
- **Tìm kiếm & Lọc**: Tìm theo tên, biển số, trạng thái

### 3. User Management (Quản lý Người dùng)
- **Danh sách người dùng**: Xem tất cả user với phân trang
- **Thêm người dùng**: Tạo tài khoản mới
- **Chỉnh sửa người dùng**: Cập nhật thông tin
- **Phân quyền**: Admin, Staff, Customer
- **Tìm kiếm & Lọc**: Tìm theo tên, email, vai trò

### 4. Booking Management (Quản lý Đặt xe)
- **Danh sách booking**: Xem tất cả đặt xe với phân trang
- **Tạo booking mới**: Form đặt xe với tính năng tự động tính giá
- **Xác nhận booking**: Xác nhận đơn đặt xe
- **Hủy booking**: Hủy đơn đặt xe
- **Tìm kiếm & Lọc**: Lọc theo trạng thái

## Cấu trúc thư mục

```
src/
├── views/                      # Handlebars templates
│   ├── layouts/
│   │   └── main.hbs           # Layout chính
│   ├── partials/
│   │   ├── navbar.hbs         # Navigation bar
│   │   └── sidebar.hbs        # Sidebar menu
│   ├── cars/
│   │   ├── list.hbs           # Danh sách xe
│   │   ├── form.hbs           # Form thêm/sửa xe
│   │   └── detail.hbs         # Chi tiết xe
│   ├── users/
│   │   ├── list.hbs           # Danh sách người dùng
│   │   └── form.hbs           # Form thêm/sửa user
│   ├── bookings/
│   │   ├── list.hbs           # Danh sách booking
│   │   └── form.hbs           # Form tạo booking
│   ├── dashboard.hbs          # Trang dashboard
│   └── error.hbs              # Trang lỗi
├── app/
│   ├── controller/
│   │   └── view.controller.js # Controllers cho views
│   └── routes/
│       └── view.route.js      # Routes cho UI
└── server.js                  # Cấu hình Handlebars

public/
├── css/
│   └── style.css              # Custom CSS
└── js/
    └── main.js                # JavaScript cho UI
```

## Cài đặt

```bash
# Cài đặt dependencies (đã bao gồm express-handlebars)
npm install

# Chạy server
npm start
```

## Truy cập ứng dụng

- **Dashboard**: http://localhost:3000/
- **Car Management**: http://localhost:3000/cars
- **User Management**: http://localhost:3000/users
- **Booking Management**: http://localhost:3000/bookings
- **API Endpoints**: http://localhost:3000/api/v1

## Công nghệ sử dụng

- **Template Engine**: Express-Handlebars 8.x
- **Frontend Framework**: Bootstrap 5.3
- **Icons**: Bootstrap Icons 1.11
- **Backend**: Express.js 5.x
- **Database**: MongoDB với Mongoose

## Handlebars Helpers

Hệ thống có sẵn các helpers hữu ích:

```javascript
// So sánh bằng
{{#if (eq value1 value2)}}...{{/if}}

// Kiểm tra trong mảng
{{#if (includes array value)}}...{{/if}}

// Lấy chữ cái đầu
{{initials "John Doe"}} // JD

// Màu theo trạng thái
{{statusColor "AVAILABLE"}} // success

// Màu theo vai trò
{{roleColor "ADMIN"}} // danger

// Format ngày
{{formatDate date}} // Jan 15, 2026
```

## Features UI

### Responsive Design
- Mobile-friendly
- Sidebar collapse trên mobile
- Responsive tables

### User Experience
- Real-time validation
- Auto-dismiss alerts (5 seconds)
- Image preview khi upload
- Confirmation dialogs
- Loading states

### Styling
- Bootstrap 5 components
- Custom CSS variables
- Consistent color scheme
- Icon system với Bootstrap Icons

## API Integration

UI tích hợp với API backend:

```javascript
// Example: Delete car
DELETE /api/v1/cars/:id

// Example: Confirm booking
PATCH /api/v1/bookings/:id/confirm

// Example: Cancel booking  
PATCH /api/v1/bookings/:id/cancel
```

## Tùy chỉnh

### Thay đổi màu sắc
Chỉnh sửa file `public/css/style.css`:

```css
:root {
    --primary-color: #0d6efd;
    --sidebar-width: 260px;
}
```

### Thêm helpers mới
Chỉnh sửa file `src/server.js`:

```javascript
helpers: {
    // Thêm helper của bạn ở đây
    myHelper: (value) => {
        return value;
    }
}
```

### Thêm pages mới
1. Tạo file .hbs trong `src/views/`
2. Thêm controller trong `view.controller.js`
3. Thêm route trong `view.route.js`

## Troubleshooting

### Views không render
- Kiểm tra đường dẫn trong `server.js`
- Verify file extension là `.hbs`
- Check layout name trong config

### Static files không load
- Kiểm tra `express.static` middleware
- Verify đường dẫn trong `public/` folder

### Form submission lỗi
- Check `express.urlencoded()` middleware
- Verify form action và method
- Check console cho errors

## License

ISC
