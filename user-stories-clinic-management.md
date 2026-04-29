# Ứng dụng quản lý phòng khám & đặt lịch khám

## User Stories - Ứng dụng quản lý phòng khám & đặt lịch khám

### Quản lý hồ sơ bệnh nhân

- Là lễ tân, tôi muốn tạo hồ sơ bệnh nhân mới để bắt đầu quản lý thông tin khám.
- Là lễ tân, tôi muốn cập nhật thông tin bệnh nhân (họ tên, ngày sinh, SĐT, địa chỉ) để đảm bảo chính xác.
- Là lễ tân, tôi muốn xóa/ẩn hồ sơ bệnh nhân khi không còn sử dụng để giảm dữ liệu rác.
- Là lễ tân/bác sĩ, tôi muốn xem danh sách bệnh nhân để tìm nhanh khi cần.

### Lịch sử khám bệnh

- Là bác sĩ, tôi muốn xem lịch sử khám của bệnh nhân để nắm tình trạng điều trị.
- Là bác sĩ, tôi muốn cập nhật kết quả khám, chẩn đoán và chỉ định để lưu hồ sơ đầy đủ.
- Là bác sĩ, tôi muốn chỉnh sửa lại nội dung khám khi có sai sót để đảm bảo đúng hồ sơ.

### Đặt lịch khám

- Là bệnh nhân, tôi muốn đặt lịch khám theo bác sĩ và dịch vụ để phù hợp nhu cầu.
- Là lễ tân, tôi muốn đặt lịch khám cho bệnh nhân trực tiếp tại quầy để hỗ trợ nhanh.
- Là hệ thống, tôi muốn kiểm tra trùng lịch để không xếp lịch sai giờ.

### Quản lý lịch bác sĩ

- Là bác sĩ, tôi muốn tạo lịch làm việc để hệ thống biết thời gian nhận khám.
- Là bác sĩ, tôi muốn cập nhật lịch làm việc khi có thay đổi để tránh trùng lịch.
- Là lễ tân, tôi muốn xem lịch bác sĩ để đặt lịch phù hợp.

### Quy trình khám bệnh

- Là lễ tân, tôi muốn chuyển trạng thái lượt khám (tiếp nhận → khám → xét nghiệm → kê đơn → thanh toán) để theo dõi tiến trình.
- Là bác sĩ, tôi muốn cập nhật trạng thái khám để phối hợp với các bộ phận khác.
- Là hệ thống, tôi muốn lưu lịch sử trạng thái khám để truy vết khi cần.

### Quản lý dịch vụ & bảng giá

- Là quản trị, tôi muốn tạo dịch vụ khám mới để mở rộng danh mục.
- Là quản trị, tôi muốn cập nhật bảng giá dịch vụ theo thời điểm để đảm bảo đúng giá.
- Là quản trị, tôi muốn ngừng áp dụng dịch vụ cũ để tránh sai lệch.

### Hóa đơn & thanh toán

- Là thu ngân, tôi muốn lập hóa đơn theo dịch vụ đã sử dụng để tính phí chính xác.
- Là thu ngân, tôi muốn ghi nhận thanh toán một phần hoặc nhiều lần để theo dõi công nợ.
- Là thu ngân, tôi muốn xem lịch sử thanh toán của bệnh nhân để đối soát.

### Thanh toán online

- Là bệnh nhân, tôi muốn thanh toán online để tiện lợi và nhanh chóng.
- Là thu ngân, tôi muốn đối soát giao dịch online để tránh sai lệch doanh thu.
- Là hệ thống, tôi muốn lưu log giao dịch để kiểm tra khi cần.

### Nhắc lịch khám

- Là bệnh nhân, tôi muốn nhận nhắc lịch qua Email/SMS để không quên lịch.
- Là lễ tân, tôi muốn cấu hình thời gian nhắc lịch (trước 1 ngày, 2 giờ…) để linh hoạt.
- Là hệ thống, tôi muốn tự động gửi nhắc lịch theo lịch hẹn để giảm thao tác thủ công.

### Phân quyền & tài khoản

- Là quản trị, tôi muốn tạo tài khoản bác sĩ/lễ tân/thu ngân để phân quyền.
- Là người dùng, tôi muốn đăng nhập để truy cập đúng dữ liệu của mình.
- Là người dùng, tôi muốn đổi mật khẩu để bảo mật tài khoản.

### Báo cáo doanh thu

- Là quản trị, tôi muốn xem doanh thu theo ngày để đánh giá hiệu quả hoạt động.
- Là quản trị, tôi muốn lọc doanh thu theo bác sĩ/dịch vụ để phân tích sâu.
- Là quản trị, tôi muốn xuất báo cáo để lưu trữ và trình bày.

### Nhật ký hoạt động (Audit log)

- Là quản trị, tôi muốn xem lịch sử chỉnh sửa hồ sơ và thanh toán để kiểm soát minh bạch.
- Là quản trị, tôi muốn tra cứu log theo thời gian/người thao tác để điều tra khi cần.

### Chat (WebSocket)

- Là nhân viên (lễ tân, bác sĩ, thu ngân), tôi muốn nhắn tin nội bộ theo thời gian thực qua WebSocket để trao đổi nhanh khi cần hỗ trợ.
- Là nhân viên, tôi muốn xem danh sách phòng chat hoặc cuộc hội thoại để chọn người cần nhắn.
- Là nhân viên, tôi muốn nhận tin nhắn mới ngay lập tức (real-time) mà không cần tải lại trang để phối hợp làm việc kịp thời.
- Là hệ thống, tôi muốn xác thực người dùng khi kết nối WebSocket để chỉ người đã đăng nhập mới chat được.
- Là hệ thống, tôi muốn lưu lịch sử tin nhắn (tùy chọn) để tham khảo hoặc kiểm tra khi cần.
