-- Gắn dịch vụ với chuyên khoa (tuỳ chọn) để màn đặt lịch lọc chuyên khoa / dịch vụ / bác sĩ thống nhất.
-- Dev: spring.jpa.hibernate.ddl-auto=update thường đã tạo cột + FK — không chạy lại nếu đã tồn tại (MySQL sẽ báo lỗi trùng cột).
-- Production (ddl validate|none): chạy một lần trên DB clinic_management.

USE clinic_management;

ALTER TABLE dich_vu
  ADD COLUMN ma_chuyen_khoa BIGINT NULL,
  ADD CONSTRAINT fk_dich_vu_chuyen_khoa
    FOREIGN KEY (ma_chuyen_khoa) REFERENCES chuyen_khoa (ma_chuyen_khoa);
