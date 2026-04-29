# 5. Khảo sát yêu cầu

## 5.1. Mục đích và đối tượng khảo sát

Khảo sát yêu cầu nhằm xác định rõ bài toán mà phòng khám đang gặp phải, nhu cầu của từng bên liên quan và các chức năng hệ thống cần đáp ứng. Đối tượng khảo sát gồm: **quản trị phòng khám** (người điều hành, cần báo cáo và kiểm soát); **lễ tân** (tiếp nhận bệnh nhân, đặt lịch, cập nhật quy trình); **bác sĩ** (xem lịch, khám bệnh, ghi chẩn đoán và lịch sử khám); **thu ngân** (lập hóa đơn, thanh toán, đối soát); **bệnh nhân** (đặt lịch, thanh toán online, nhận nhắc lịch). Nhóm tiến hành phỏng vấn trực tiếp và trao đổi với một số phòng khám quy mô vừa và nhỏ, đồng thời tham khảo quy trình vận hành và phần mềm quản lý phòng khám hiện có trên thị trường để bổ sung yêu cầu.

## 5.2. Phương pháp khảo sát

- **Phỏng vấn:** Trao đổi với quản lý và nhân viên (lễ tân, thu ngân) về quy trình hiện tại, điểm khó khăn (trùng lịch, tra cứu hồ sơ, lập hóa đơn, báo cáo doanh thu) và mong muốn khi có phần mềm (đặt lịch online, nhắc lịch, phân quyền rõ ràng, xem báo cáo nhanh).

- **Quan sát:** Theo dõi luồng từ tiếp nhận bệnh nhân → đăng ký khám → khám → thanh toán để nắm trạng thái cần theo dõi và cách phối hợp giữa các bộ phận.

- **Nghiên cứu tài liệu:** Tham khảo tài liệu về quy trình khám chữa bệnh, quản lý dịch vụ y tế và các hệ thống quản lý phòng khám tương tự để đảm bảo yêu cầu đầy đủ và phù hợp thực tế.

Kết quả khảo sát được tổng hợp thành danh sách yêu cầu chức năng (theo từng vai trò) và yêu cầu phi chức năng, làm cơ sở cho phân tích use case và thiết kế hệ thống.

## 5.3. Yêu cầu chức năng

Yêu cầu chức năng được nhóm theo các nhóm nghiệp vụ và đối tượng sử dụng, thống nhất với sơ đồ use case của hệ thống.

**Quản lý hồ sơ bệnh nhân:** Lễ tân tạo, cập nhật, xóa/ẩn và tra cứu hồ sơ bệnh nhân (họ tên, ngày sinh, SĐT, địa chỉ). Lễ tân và bác sĩ xem danh sách bệnh nhân để tìm nhanh khi cần.

**Lịch sử khám bệnh:** Bác sĩ xem lịch sử khám của bệnh nhân; cập nhật kết quả khám, chẩn đoán và chỉ định; chỉnh sửa nội dung khám khi có sai sót.

**Đặt lịch khám và quản lý lịch bác sĩ:** Bệnh nhân hoặc lễ tân đặt lịch theo bác sĩ và dịch vụ; hệ thống kiểm tra trùng lịch. Bác sĩ tạo và cập nhật lịch làm việc; lễ tân xem lịch bác sĩ để đặt lịch phù hợp.

**Quy trình khám bệnh:** Lễ tân và bác sĩ chuyển/cập nhật trạng thái lượt khám (tiếp nhận → khám → xét nghiệm → kê đơn → thanh toán); hệ thống lưu lịch sử trạng thái để truy vết.

**Quản lý dịch vụ và bảng giá:** Quản trị tạo, cập nhật và ngừng áp dụng dịch vụ khám; cập nhật bảng giá theo thời điểm.

**Hóa đơn và thanh toán:** Thu ngân lập hóa đơn theo dịch vụ đã sử dụng; ghi nhận thanh toán một phần hoặc nhiều lần; xem lịch sử thanh toán. Hỗ trợ thanh toán online; hệ thống lưu log giao dịch và hỗ trợ đối soát.

**Nhắc lịch khám:** Bệnh nhân nhận nhắc lịch qua email/SMS; lễ tân (hoặc quản trị) cấu hình thời gian nhắc (trước 1 ngày, 2 giờ…); hệ thống tự động gửi nhắc theo lịch hẹn.

**Phân quyền và tài khoản:** Quản trị tạo tài khoản và phân vai trò (bác sĩ, lễ tân, thu ngân). Người dùng đăng nhập và đổi mật khẩu; hệ thống áp dụng phân quyền theo vai trò.

**Báo cáo và kiểm soát:** Quản trị xem doanh thu theo ngày, lọc theo bác sĩ/dịch vụ và xuất báo cáo (Excel). Quản trị xem nhật ký hoạt động (audit log), tra cứu theo thời gian/người thao tác để kiểm soát và điều tra khi cần.

**Chat nội bộ (tùy chọn):** Nhân viên nhắn tin nội bộ theo thời gian thực (WebSocket) để trao đổi nhanh khi cần hỗ trợ; hệ thống xác thực người dùng và có thể lưu lịch sử tin nhắn.

## 5.4. Yêu cầu phi chức năng

- **Bảo mật:** Đăng nhập bắt buộc; phân quyền theo vai trò; mật khẩu được mã hóa; ghi nhật ký hoạt động với các thao tác nhạy cảm (sửa hồ sơ, thanh toán).

- **Hiệu năng và ổn định:** Giao diện phản hồi trong thời gian chấp nhận được; hệ thống xử lý đồng thời nhiều người dùng (lễ tân, bác sĩ, thu ngân) mà không sai lệch dữ liệu.

- **Dễ sử dụng:** Giao diện rõ ràng, thao tác phù hợp với quy trình thực tế; hỗ trợ tra cứu nhanh (bệnh nhân, lịch hẹn, hóa đơn).

- **Khả năng mở rộng:** Kiến trúc tách tầng (frontend – backend), API chuẩn để có thể mở rộng tính năng hoặc tích hợp kênh khác (ứng dụng di động) sau này.

Kết quả khảo sát yêu cầu trên là cơ sở để nhóm xây dựng sơ đồ use case, user stories và triển khai các chức năng hệ thống trong các chương tiếp theo.
