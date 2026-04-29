# 3. Mục tiêu đồ án

## Mục tiêu chung

Xây dựng **hệ thống quản lý phòng khám** trên nền web, hỗ trợ toàn bộ quy trình vận hành từ tiếp nhận bệnh nhân, đặt lịch khám, khám bệnh đến lập hóa đơn và thanh toán; đồng thời cung cấp công cụ quản trị, báo cáo và kiểm soát nội bộ cho chủ phòng khám.

## Mục tiêu cụ thể

- **Quản lý hồ sơ và lịch sử khám:** Cho phép lễ tân tạo, cập nhật, tra cứu hồ sơ bệnh nhân; bác sĩ xem và cập nhật lịch sử khám, chẩn đoán, chỉ định để phục vụ tái khám và theo dõi điều trị.

- **Đặt lịch và quản lý lịch bác sĩ:** Hỗ trợ bệnh nhân hoặc lễ tân đặt lịch theo bác sĩ và dịch vụ; kiểm tra trùng lịch; quản lý lịch làm việc của bác sĩ và gửi nhắc lịch (email/SMS) để giảm bỏ hẹn.

- **Quy trình khám và thanh toán:** Theo dõi trạng thái từng lượt khám (tiếp nhận → khám → xét nghiệm → kê đơn → thanh toán); lập hóa đơn theo dịch vụ, ghi nhận thanh toán nhiều lần và thanh toán online; đối soát và báo cáo doanh thu theo ngày, bác sĩ, dịch vụ.

- **Quản trị và an toàn thông tin:** Phân quyền rõ ràng (quản trị, lễ tân, bác sĩ, thu ngân); quản lý tài khoản và đăng nhập bảo mật (JWT); ghi nhật ký hoạt động (audit log) để truy vết thao tác khi cần.

- **Trải nghiệm người dùng:** Giao diện web thân thiện, dễ sử dụng; bệnh nhân có thể đặt lịch và thanh toán online; nhân viên tra cứu nhanh và cập nhật quy trình trên cùng một hệ thống.

Kết quả mong đợi là một hệ thống hoạt động ổn định, đáp ứng đủ nhu cầu quản lý của phòng khám quy mô vừa và nhỏ, làm cơ sở để mở rộng hoặc tích hợp thêm dịch vụ sau này.
