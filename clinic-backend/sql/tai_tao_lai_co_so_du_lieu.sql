-- Sau khi đổi @Table/@Column sang tiếng Việt, Hibernate ddl-auto=update tạo bảng mới
-- nhưng không xóa/đổi tên bảng cũ. Để schema khớp hoàn toàn, có thể tạo lại CSDL:
DROP DATABASE IF EXISTS clinic_management;
CREATE DATABASE clinic_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
