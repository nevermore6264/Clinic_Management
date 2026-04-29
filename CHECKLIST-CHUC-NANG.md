# Đối chiếu User Stories vs Hiện trạng

## ✅ Đã đủ

| Nhóm                  | User story                             | Backend                                 | Frontend                                 |
| --------------------- | -------------------------------------- | --------------------------------------- | ---------------------------------------- |
| **Bệnh nhân**         | Tạo hồ sơ mới                          | POST /api/patients                      | /patients/new                            |
|                       | Cập nhật thông tin                     | PUT /api/patients/{id}                  | /patients/[id]                           |
|                       | Xem danh sách, tìm kiếm                | GET list, search                        | /patients                                |
| **Lịch sử khám**      | Cập nhật chẩn đoán, chỉ định           | POST visit-records/appointment/{id}     | Trong /appointments/[id]                 |
| **Đặt lịch**          | Đặt theo bác sĩ, dịch vụ               | POST /api/appointments + kiểm tra trùng | /appointments/new                        |
| **Quy trình khám**    | Chuyển trạng thái (tiếp nhận→khám→...) | PATCH status                            | /appointments/[id] nút trạng thái        |
| **Dịch vụ**           | Tạo/sửa/ngừng dịch vụ                  | CRUD /api/services                      | /services, /services/new, /services/[id] |
| **Hóa đơn**           | Lập HĐ theo dịch vụ                    | POST /api/invoices                      | /invoices/new                            |
|                       | Thanh toán nhiều lần                   | POST .../payments                       | /invoices/[id] modal thanh toán          |
|                       | Lịch sử thanh toán                     | GET by patient, items+payments          | /invoices/[id]                           |
| **Thanh toán online** | Ghi nhận (method ONLINE)               | Payment.method = ONLINE                 | Hình thức "Online" trong modal           |
| **Phân quyền**        | Đăng nhập                              | POST /api/auth/login, JWT               | /login, NavBar                           |
| **Báo cáo**           | Doanh thu theo ngày                    | GET /api/reports/revenue                | /reports                                 |

## ✅ Đã bổ sung (sau rà soát)

| Nhóm             | User story                     | Cách đã làm                                                                                                    |
| ---------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Bệnh nhân**    | Xóa/ẩn hồ sơ                   | FE: nút "Ẩn hồ sơ" trên trang sửa bệnh nhân (/patients/[id])                                                   |
| **Lịch sử khám** | Xem lịch sử khám của bệnh nhân | FE: block "Lịch sử khám" trên /patients/[id], link tới từng lịch                                               |
| **Lịch bác sĩ**  | Tạo/cập nhật/xem lịch làm việc | FE: /doctor-schedules (xem theo bác sĩ + ngày, thêm/xóa ca; lịch đã đặt)                                       |
| **Phân quyền**   | Quản trị tạo tài khoản         | BE: POST /api/users; FE: /users (danh sách + modal tạo, chọn vai trò)                                          |
|                  | Đổi mật khẩu                   | BE: PUT /api/auth/change-password; FE: /change-password + link trên NavBar                                     |
| **Audit log**    | Xem lịch sử chỉnh sửa, tra cứu | BE: AuditLogService + GET /api/audit-logs (theo ngày); ghi log khi tạo/sửa/ẩn Patient; FE: /audit-logs (Admin) |

## ✅ Tính năng nâng cao (ăn điểm đồ án xuất sắc)

| Tính năng                    | Mô tả                                                                                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard thống kê**       | API `/api/dashboard/stats`: tổng bệnh nhân, lượt khám hôm nay/tuần, doanh thu hôm nay/tuần, doanh thu 7 ngày. FE: thẻ số liệu + biểu đồ cột 7 ngày.                                     |
| **Xuất báo cáo Excel**       | GET `/api/reports/revenue/export?from=&to=&doctorId=&serviceId=`, file .xlsx. FE: nút "Xuất Excel" trên trang báo cáo.                                                                  |
| **Báo cáo lọc**              | Lọc doanh thu theo bác sĩ và/hoặc dịch vụ (dropdown trên trang báo cáo).                                                                                                                |
| **Nhắc lịch Email**          | Cấu hình: GET/PUT `/api/reminder-config` (số ngày/giờ trước, bật email). Job @Scheduled mỗi 15 phút gửi email nhắc bệnh nhân (nếu có email). FE: trang /reminder-config (Admin/Lễ tân). |
| **In hóa đơn**               | Trang /invoices/[id]/print, nút "In hóa đơn" trên chi tiết HĐ, CSS @media print chỉ in nội dung hóa đơn.                                                                                |
| **Global exception handler** | @RestControllerAdvice: validation → message tiếng Việt, RuntimeException → message, Exception → "Lỗi hệ thống". Response thống nhất { code, message, timestamp }.                       |

## Ghi chú

- **Sao lưu & khôi phục** (use case): thường làm ngoài app (DB backup), không tích trong MVP.
- **Thanh toán online** thật (cổng VNPay/Momo): cần tích hợp bên thứ 3, hiện chỉ ghi nhận hình thức "Online" và mã giao dịch.
