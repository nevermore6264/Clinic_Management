# 4. Cơ sở lý thuyết

## 4.1. Hệ thống thông tin quản lý

Hệ thống thông tin quản lý (Management Information System – MIS) là hệ thống thu thập, xử lý, lưu trữ và cung cấp thông tin phục vụ công tác quản lý, điều hành trong tổ chức. Hệ thống giúp chuẩn hóa quy trình nghiệp vụ, giảm thao tác thủ công, cung cấp dữ liệu đúng lúc để ra quyết định. Trong bối cảnh phòng khám, hệ thống thông tin quản lý hỗ trợ quản lý hồ sơ bệnh nhân, lịch khám, quy trình khám – thanh toán và báo cáo doanh thu, là nền tảng lý thuyết để xác định phạm vi và mục tiêu của đồ án.

## 4.2. Quy trình phát triển phần mềm

Phát triển phần mềm thường được tổ chức theo các giai đoạn: **khảo sát và thu thập yêu cầu** (xác định bài toán, đối tượng sử dụng, chức năng cần có); **phân tích** (mô hình hóa nghiệp vụ, use case, luồng xử lý); **thiết kế** (thiết kế kiến trúc, cơ sở dữ liệu, giao diện); **lập trình và kiểm thử** (triển khai code, kiểm tra từng chức năng và tích hợp); **triển khai và bảo trì** (đưa hệ thống vào sử dụng, cập nhật khi có thay đổi). Áp dụng quy trình này giúp đồ án đi từ yêu cầu đến sản phẩm có cấu trúc, dễ kiểm soát chất lượng và tiến độ.

## 4.3. Phân tích và thiết kế hệ thống (UML)

UML (Unified Modeling Language) là ngôn ngữ mô hình hóa thống nhất dùng trong phân tích và thiết kế phần mềm. Các công cụ thường dùng gồm: **sơ đồ use case** – mô tả tác nhân (actor) và các chức năng (use case) của hệ thống, quan hệ include/extend; **sơ đồ lớp** – mô tả cấu trúc các lớp đối tượng và quan hệ giữa chúng; **sơ đồ trình tự** – mô tả thứ tự tương tác giữa các đối tượng theo thời gian; **sơ đồ thực thể – quan hệ (ERD)** – mô tả các thực thể, thuộc tính và quan hệ để thiết kế cơ sở dữ liệu. Trong đồ án, nhóm sử dụng use case để xác định yêu cầu và phạm vi, sau đó thiết kế cơ sở dữ liệu và API dựa trên các mô hình trên.

## 4.4. Cơ sở dữ liệu quan hệ

Cơ sở dữ liệu quan hệ tổ chức dữ liệu dưới dạng các bảng (quan hệ); mỗi bảng có các cột (thuộc tính) và các dòng (bản ghi). **Khóa chính** (primary key) xác định duy nhất mỗi bản ghi; **khóa ngoại** (foreign key) thiết lập quan hệ giữa các bảng, đảm bảo tính toàn vẹn tham chiếu. Chuẩn hóa dữ liệu (normalization) giúp giảm dư thừa và không nhất quán. Trong hệ thống quản lý phòng khám, dữ liệu bệnh nhân, lịch hẹn, bác sĩ, dịch vụ, hóa đơn, thanh toán… được mô hình hóa thành các bảng có quan hệ với nhau, tạo nền tảng lưu trữ và truy vấn ổn định.

## 4.5. Bảo mật và phân quyền

Bảo mật hệ thống gồm **xác thực** (authentication) – xác định đúng danh tính người dùng (ví dụ đăng nhập bằng tài khoản/mật khẩu) và **phân quyền** (authorization) – xác định người dùng được phép thực hiện thao tác nào. Trong ứng dụng web, sau khi xác thực thành công, server có thể cấp **token** (ví dụ JWT) cho client; client gửi kèm token trong mỗi request để server nhận biết người dùng và áp dụng phân quyền theo vai trò (quản trị, lễ tân, bác sĩ, thu ngân). Cơ sở lý thuyết về xác thực và phân quyền được áp dụng để thiết kế cơ chế đăng nhập, phân quyền truy cập chức năng và bảo vệ dữ liệu theo từng vai trò.

## 4.6. Công nghệ sử dụng trong đồ án

Đồ án sử dụng kiến trúc tách tầng: **backend** (Spring Boot, Java 17) cung cấp REST API, xác thực JWT, kết nối cơ sở dữ liệu qua JPA và tích hợp WebSocket, gửi email, xuất Excel; **frontend** (Next.js, React, TypeScript) xây dựng giao diện web và gọi API; **cơ sở dữ liệu** MySQL lưu trữ dữ liệu nghiệp vụ. Các công nghệ này là công cụ triển khai cụ thể dựa trên cơ sở lý thuyết về hệ thống thông tin, quy trình phát triển phần mềm, mô hình dữ liệu quan hệ và bảo mật đã nêu ở các mục trên.
