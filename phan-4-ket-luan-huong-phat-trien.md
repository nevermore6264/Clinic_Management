# Phần 4: Kết luận và hướng phát triển

## Kết luận

Đồ án đã xây dựng được hệ thống quản lý phòng khám trên nền web với đầy đủ chức năng: quản lý hồ sơ bệnh nhân, lịch sử khám, đặt lịch và lịch bác sĩ, quy trình khám bệnh, dịch vụ và bảng giá, hóa đơn và thanh toán (kể cả thanh toán online), nhắc lịch, phân quyền và báo cáo doanh thu, nhật ký hoạt động. Hệ thống giúp chuẩn hóa quy trình, giảm thao tác thủ công và hỗ trợ ra quyết định dựa trên số liệu. Trong quá trình thực hiện, nhóm đã vận dụng kiến thức về phân tích thiết kế hệ thống, cơ sở dữ liệu, bảo mật và công nghệ web (Spring Boot, Next.js) để triển khai đúng yêu cầu đặt ra.

## Hướng phát triển

- Tích hợp cổng thanh toán online thật (VNPay, Momo) và gửi SMS nhắc lịch.
- Ứng dụng di động cho bệnh nhân (đặt lịch, xem lịch sử, thanh toán).
- Mở rộng báo cáo (thống kê theo bệnh lý, tỷ lệ tái khám) và hỗ trợ in phiếu khám, đơn thuốc.
- Sao lưu và khôi phục dữ liệu tự động, nâng cấp bảo mật (2FA, audit chi tiết hơn).
