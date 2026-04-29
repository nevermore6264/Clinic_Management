# 6. Phân tích hệ thống

_(Trong báo cáo, nếu dùng cấu trúc "Phần 2: Phân tích, thiết kế hướng đối tượng" thì mục này tương ứng **2.2 Phân tích hệ thống**, với các tiểu mục 2.2.1–2.2.4.)_

## 6.1. Liệt kê các tác nhân (2.2.1)

Các **tác nhân** (actor) tương tác với hệ thống quản lý phòng khám được xác định như sau:

| Tác nhân      | Mô tả                                                              | Vai trò chính                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quản trị**  | Người điều hành phòng khám, quản lý cấu hình và kiểm soát hệ thống | Quản lý dịch vụ và bảng giá; quản lý tài khoản và phân quyền; xem báo cáo doanh thu; xem nhật ký hoạt động (audit log); cấu hình sao lưu/khôi phục (nếu có).                                 |
| **Lễ tân**    | Nhân viên tiếp tân, tiếp nhận bệnh nhân và hỗ trợ đặt lịch         | Quản lý hồ sơ bệnh nhân; xem lịch sử khám; đặt lịch khám cho bệnh nhân; xem và hỗ trợ quản lý lịch bác sĩ; cập nhật quy trình khám bệnh (trạng thái lượt khám); cấu hình/thao tác nhắc lịch. |
| **Bác sĩ**    | Bác sĩ khám bệnh                                                   | Xem và cập nhật lịch sử khám; quản lý lịch làm việc (tạo/cập nhật lịch); cập nhật trạng thái quy trình khám (đang khám, đã kê đơn…).                                                         |
| **Thu ngân**  | Nhân viên thu ngân                                                 | Lập hóa đơn và ghi nhận thanh toán; xử lý thanh toán online và đối soát; xem báo cáo doanh thu (theo quyền).                                                                                 |
| **Bệnh nhân** | Người đến khám                                                     | Đặt lịch khám (theo bác sĩ, dịch vụ); thanh toán online; nhận nhắc lịch (email/SMS).                                                                                                         |

---

## 6.2. Sơ đồ Use case (2.2.2)

Sơ đồ use case mô tả các tác nhân và các chức năng (use case) của hệ thống, cùng quan hệ include/extend giữa các use case.

**Các use case chính (tổng quan theo nhóm):** Xác thực (đăng nhập JWT, đổi mật khẩu, tạo tài khoản & phân quyền, **đăng ký tài khoản bệnh nhân**); Hồ sơ bệnh nhân (tạo/cập nhật/ẩn, tìm kiếm, lịch sử khám); Lịch khám (**xem bác sĩ & lịch, đặt lịch, kiểm tra trùng lịch, hủy/đổi lịch, xem lịch hẹn của tôi, tiếp nhận check-in, xem hàng chờ**, cập nhật lịch, ca làm việc bác sĩ, trạng thái lượt khám, kết quả khám); Dịch vụ (**xem danh sách dịch vụ & giá**, cập nhật danh mục — quản trị); Hóa đơn & thanh toán (tạo HĐ, ghi nhận thanh toán, thanh toán online, **xem HĐ & lịch sử thanh toán, in/xuất PDF, đối soát thanh toán online**); Nhắc lịch & báo cáo (nhắc lịch, báo cáo doanh thu, xuất Excel); Chat nội bộ; Dashboard thống kê.

**Quan hệ include/extend (một phần):** Đặt lịch _include_ kiểm tra trùng lịch; **Hủy/đổi lịch** _extend_ đặt lịch và _include_ kiểm tra trùng lịch; **Tiếp nhận check-in** _include_ cập nhật trạng thái lượt khám; Cập nhật trạng thái lượt khám _include_ ghi nhận kết quả khám; Tạo hóa đơn _include_ ghi nhận thanh toán (khi ghi nhận); Thanh toán online _extend_ thanh toán; Nhắc lịch _extend_ đặt lịch; Xuất Excel _extend_ báo cáo doanh thu; Chat _include_ lịch sử chat; **Đăng ký BN** _include_ đăng nhập (sau đăng ký); **In PDF** _include_ tạo hóa đơn; **Đối soát online** _extend_ thanh toán online.

_(Các mục như nhật ký audit, cấu hình nhắc lịch chi tiết, sao lưu/khôi phục có thể mô tả ở mục kỹ thuật/triển khai nếu không đưa vào sơ đồ use case chi tiết.)_

Sơ đồ use case được vẽ bằng PlantUML:

- **`use-case-clinic-management-tong-quan.puml`** — bản **tổng quan** (8 nhóm G1–G8, ít liên kết, **dễ nhìn** khi trình bày / in).
- **`use-case-clinic-management.puml`** — bản **chi tiết** (đủ UC1–UC34, quan hệ «include»/«extend», màu theo nhóm).

Khi viết báo cáo, nên chèn **cả hai** (tổng quan trước, chi tiết sau) hoặc chỉ bản tổng quan nếu giới hạn trang; ghi chú ngắn từng nhóm theo tác nhân.

---

## 6.3. Kịch bản và sơ đồ hoạt động (2.2.3)

**Nội dung đầy đủ theo từng use case (UC1–UC34):** xem file **`2.2.3-kich-ban-activity.md`**. Mỗi mục **2.2.3._n_** có **kịch bản dạng bảng** (Mô tả, Tác nhân, Đầu vào, Đầu ra, Luồng cơ bản, Luồng thay thế, Luồng ngoại lệ) và tham chiếu file PlantUML **`diagrams/activity-uc/uc##_*.puml`**. Xuất hình từ PlantUML để chèn vào báo cáo Word mục 2.2.3 (có thể copy bảng từ Markdown sang Word và chỉnh định dạng viền bảng).

**Luồng tổng hợp (ôn tập nhanh):**

- **Đặt lịch (UC10, UC11):** chọn bác sĩ — dịch vụ — giờ; kiểm tra trùng lịch; tạo lịch SCHEDULED; có thể nhắc lịch (UC20).
- **Khám (UC14, UC15, UC27):** check-in → cập nhật trạng thái lượt khám → ghi nhận kết quả khám.
- **Hóa đơn — thanh toán (UC17–UC19):** tạo HĐ, dòng dịch vụ; ghi nhận thanh toán; thanh toán online mở rộng (extend) ghi nhận.

**Sơ đồ hoạt động mẫu (luồng chính, có thể giữ trong thư mục `diagrams/`):** `activity-dat-lich-kham.puml` (đặt lịch), `activity-quy-trinh-kham.puml` (quy trình khám) — bổ sung cho các sơ đồ theo từng UC trong `diagrams/activity-uc/`.

---

### Sơ đồ Robustness (mục 2.2.4 — theo đề cương báo cáo)

Sơ đồ **Robustness** (Boundary – Control – Entity) cho **từng use case**: thư mục `diagrams/robustness-uc/` (34 file `ruc01-*.puml` … `ruc34-*.puml`). Danh sách và chú thích: **`2.2.4-so-do-robustness.md`**. Sinh lại: `python scripts/gen_robustness_uc.py`.

---

## 6.4. Thiết kế ERD (2.2.5 hoặc mục ERD trong đề cương)

Thiết kế cơ sở dữ liệu theo mô hình thực thể – quan hệ (ERD), ánh xạ từ các entity trong hệ thống.

**Các thực thể chính và quan hệ:**

- **users** – Người dùng hệ thống (username, passwordHash, role, fullName, email, phone, active). Quan hệ: 1–1 với _patients_ (bệnh nhân có thể gắn tài khoản); liên quan đến phân quyền (bác sĩ, lễ tân, thu ngân gắn user).

- **patients** – Bệnh nhân (fullName, dateOfBirth, phone, address, email, active, user*id). Quan hệ: 1–n với \_appointments*, 1–n với _invoices_.

- **doctors** – Bác sĩ (gắn với user hoặc thông tin riêng tùy thiết kế). Quan hệ: 1–n với _appointments_, 1–n với _doctor_schedules_.

- **services** – Dịch vụ khám (tên, giá, active). Quan hệ: 1–n với _appointments_; dùng trong _invoice_items_ (dòng hóa đơn).

- **appointments** – Lịch hẹn (patient*id, doctor_id, service_id, appointmentDate, appointmentTime, status, note). Trạng thái: SCHEDULED, CHECKED_IN, IN_EXAM, LAB_TEST, PRESCRIBED, PAID, CANCELLED, NO_SHOW. Quan hệ: n–1 patient, n–1 doctor, n–1 service; 1–1 với \_invoices* (tùy chọn).

- **doctor_schedules** – Lịch làm việc bác sĩ (doctor_id, ngày, ca/slot). Quan hệ: n–1 doctor.

- **visit_records** – Lịch sử khám (gắn với appointment hoặc patient; chẩn đoán, chỉ định). Quan hệ: n–1 appointment (hoặc patient).

- **invoices** – Hóa đơn (patient*id, appointment_id, totalAmount, paidAmount, status, invoiceNumber). Quan hệ: n–1 patient; 1–1 appointment (tùy chọn); 1–n \_invoice_items*, 1–n _payments_.

- **invoice_items** – Dòng hóa đơn (invoice_id, service_id, số lượng, đơn giá, thành tiền). Quan hệ: n–1 invoice, n–1 service.

- **payments** – Thanh toán (invoice_id, số tiền, thời gian, phương thức: CASH/ONLINE, mã giao dịch). Quan hệ: n–1 invoice.

- **audit_logs** – Nhật ký hoạt động (entity, action, user, thời gian, chi tiết). Phục vụ kiểm soát và truy vết.

- **appointment_reminder_config** – Cấu hình nhắc lịch (số ngày/giờ trước, bật email/SMS). **appointment_reminder_log** – Log đã gửi nhắc (appointment_id, thời điểm gửi).

- **chat_messages** – Tin nhắn chat nội bộ (sender, receiver, nội dung, thời gian) nếu có tính năng chat.

Sơ đồ ERD được vẽ bằng PlantUML, file: `diagrams/erd-clinic-management.puml`. Trong báo cáo, xuất hình từ file này (hoặc từ công cụ MySQL Workbench, draw.io nếu thiết kế lại) và chèn vào mục 6.4, kèm ghi chú ngắn các bảng chính và khóa ngoại.
