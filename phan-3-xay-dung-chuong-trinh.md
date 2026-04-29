# Phần 3: Xây dựng chương trình

## 3.1. Công nghệ sử dụng

**Backend:** Spring Boot 3.2 (Java 17), Spring Data JPA, Spring Security, JWT (JJWT), Spring WebSocket, Spring Mail, Apache POI (xuất Excel). Cơ sở dữ liệu MySQL.

**Frontend:** Next.js 14, React 18, TypeScript, React Bootstrap, STOMP/SockJS (WebSocket cho chat).

**Công cụ:** Maven (backend), npm (frontend), Git. Có thể dùng Postman/Insomnia để kiểm thử API.

## 3.2. Giao diện

Hệ thống cung cấp giao diện web responsive: trang đăng nhập, dashboard, quản lý bệnh nhân, đặt lịch, lịch bác sĩ, quy trình khám (trạng thái lượt khám), quản lý dịch vụ, lập hóa đơn và thanh toán, báo cáo doanh thu, cấu hình nhắc lịch, nhật ký hoạt động (audit log), quản lý tài khoản. Giao diện được xây dựng bằng React Bootstrap, thống nhất về màu sắc và bố cục. Khi viết báo cáo, chèn ảnh chụp màn hình (screenshot) các trang chính vào mục này.
