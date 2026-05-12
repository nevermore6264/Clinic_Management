-- Seed loại dịch vụ & dịch vụ mẫu (ngành y tế). Chạy trên MySQL, DB clinic_management.
-- An toàn khi chạy lại: chỉ INSERT khi chưa có bản ghi trùng tên loại / cặp (tên dịch vụ + loại).
-- Charset: utf8mb4 (khớp connection-init-sql của ứng dụng).

USE clinic_management;

-- ========== LOẠI DỊCH VỤ (14 nhóm) ==========
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Khám bệnh' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Khám bệnh');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Xét nghiệm' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Xét nghiệm');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Chẩn đoán hình ảnh' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Chẩn đoán hình ảnh');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Thủ thuật' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Thủ thuật');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Tiêm chủng' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Tiêm chủng');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Tư vấn' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Tư vấn');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Cận lâm sàng' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Cận lâm sàng');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Sản phụ khoa' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Sản phụ khoa');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Da liễu' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Da liễu');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Chỉnh hình' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Chỉnh hình');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Răng hàm mặt' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Răng hàm mặt');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Cấp cứu y tế' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Cấp cứu y tế');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Chăm sóc sức khỏe tại nhà' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Chăm sóc sức khỏe tại nhà');
INSERT INTO loai_dich_vu (ten_loai_dich_vu)
SELECT 'Dịch vụ y tế chuyên khoa' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM loai_dich_vu WHERE ten_loai_dich_vu = 'Dịch vụ y tế chuyên khoa');

-- Helper: thêm dịch vụ nếu chưa có cùng tên trong cùng loại
-- (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)

-- ========== KHÁM BỆNH (bổ sung thêm các mục thường gặp) ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám sản khoa thai', l.ma_loai_dich_vu, 'Theo dõi thai, siêu âm thai cơ bản, tư vấn dinh dưỡng thai kỳ', 250000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám sản khoa thai' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám tim mạch', l.ma_loai_dich_vu, 'Khám tầm soát bệnh lý tim mạch, huyết áp, nhịp tim', 280000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám tim mạch' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám tiêu hóa - gan mật', l.ma_loai_dich_vu, 'Tư vấn và khám các bệnh dạ dày, gan, đường ruột', 260000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám tiêu hóa - gan mật' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám cơ xương khớp', l.ma_loai_dich_vu, 'Đau lưng, khớp gối, viêm khớp, thoái hóa', 240000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám cơ xương khớp' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám mắt tổng quát', l.ma_loai_dich_vu, 'Thị lực, nhãn áp, đáy mắt sơ bộ', 200000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám mắt tổng quát' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== XÉT NGHIỆM ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Sinh hóa máu cơ bản', l.ma_loai_dich_vu, 'GOT, GPT, creatinine, ure, điện giải đồ', 350000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Sinh hóa máu cơ bản' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'HbA1c', l.ma_loai_dich_vu, 'Đánh giá đường huyết trung bình 2–3 tháng', 180000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'HbA1c' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tổng phân tích nước tiểu', l.ma_loai_dich_vu, 'Protein, glucose, bạch cầu, nitrite…', 90000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tổng phân tích nước tiểu' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Xét nghiệm chức năng tuyến giáp (TSH)', l.ma_loai_dich_vu, 'Sàng lọc cường/nhược giáp', 160000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Xét nghiệm chức năng tuyến giáp (TSH)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Đông máu (PT, APTT)', l.ma_loai_dich_vu, 'Trước thủ thuật hoặc theo chỉ định', 200000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Đông máu (PT, APTT)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== CHẨN ĐOÁN HÌNH ẢNH ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'X-quang ngực thẳng/nghiêng', l.ma_loai_dich_vu, 'Chụp X-quang phổi theo chỉ định', 120000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chẩn đoán hình ảnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'X-quang ngực thẳng/nghiêng' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Siêu âm ổ bụng tổng quát', l.ma_loai_dich_vu, 'Gan, mật, tụy, thận, lách…', 280000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chẩn đoán hình ảnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Siêu âm ổ bụng tổng quát' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Siêu âm thai nhi trong 3 tháng đầu', l.ma_loai_dich_vu, 'Theo dõi thai sớm', 320000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chẩn đoán hình ảnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Siêu âm thai nhi trong 3 tháng đầu' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'CT Scanner (theo vùng)', l.ma_loai_dich_vu, 'Giá tham khảo — theo chỉ định bác sĩ và vùng chụp', 2500000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chẩn đoán hình ảnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'CT Scanner (theo vùng)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'MRI (theo vùng)', l.ma_loai_dich_vu, 'Cộng hưởng từ — giá tham khảo', 4500000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chẩn đoán hình ảnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'MRI (theo vùng)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== THỦ THUẬT ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Cắt chỉ tại phòng khám', l.ma_loai_dich_vu, 'Tháo chỉ sau phẫu thuật/thủ thuật', 80000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Thủ thuật'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Cắt chỉ tại phòng khám' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Dẫn lưu áp-xe nhỏ', l.ma_loai_dich_vu, 'Xử trí áp-xe nông theo chỉ định', 450000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Thủ thuật'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Dẫn lưu áp-xe nhỏ' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Nội soi tai mũi họng', l.ma_loai_dich_vu, 'Tham khám đường thở trên', 550000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Thủ thuật'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Nội soi tai mũi họng' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== TIÊM CHỦNG ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Vaccine cúm mùa (inactivated)', l.ma_loai_dich_vu, 'Tiêm theo mùa và chỉ định', 350000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Tiêm chủng'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Vaccine cúm mùa (inactivated)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Vaccine viêm gan B (mũi đơn)', l.ma_loai_dich_vu, 'Theo lịch tiêm chủng mở rộng / người lớn', 180000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Tiêm chủng'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Vaccine viêm gan B (mũi đơn)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Uốn ván (TT)', l.ma_loai_dich_vu, 'Sau vết thương hở — theo chỉ định', 120000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Tiêm chủng'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Uốn ván (TT)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== TƯ VẤN ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tư vấn dinh dưỡng', l.ma_loai_dich_vu, 'Giảm cân, tiểu đường, tăng huyết áp', 300000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Tư vấn'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tư vấn dinh dưỡng' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tư vấn tâm lý ngắn', l.ma_loai_dich_vu, 'Stress, lo âu nhẹ — 30–45 phút', 400000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Tư vấn'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tư vấn tâm lý ngắn' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tư vấn tiền hôn nhân', l.ma_loai_dich_vu, 'Sàng lọc bệnh di truyền, sức khỏe sinh sản', 350000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Tư vấn'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tư vấn tiền hôn nhân' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== CẬN LÂM SÀNG ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Điện tim (ECG) 12 chuyển đạo', l.ma_loai_dich_vu, 'Ghi nhận nhịp tim, thiếu máu cục bộ', 150000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Cận lâm sàng'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Điện tim (ECG) 12 chuyển đạo' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Holter tim 24h', l.ma_loai_dich_vu, 'Theo dõi rối loạn nhịp theo chỉ định', 1200000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Cận lâm sàng'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Holter tim 24h' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Đo chức năng hô hấp (spirometry)', l.ma_loai_dich_vu, 'Đánh giá hạn chế luồng khí', 380000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Cận lâm sàng'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Đo chức năng hô hấp (spirometry)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== SẢN PHỤ KHOA ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Siêu âm thai hệ thống', l.ma_loai_dich_vu, 'Theo dõi thai theo tuần', 300000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Sản phụ khoa'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Siêu âm thai hệ thống' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám phụ khoa định kỳ', l.ma_loai_dich_vu, 'Tầm soát viêm nhiễm, u xơ tử cung', 280000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Sản phụ khoa'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám phụ khoa định kỳ' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Theo dõi chuyển dạ', l.ma_loai_dich_vu, 'Theo dõi sản khoa tại cơ sở', 500000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Sản phụ khoa'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Theo dõi chuyển dạ' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== DA LIỄU (bổ sung ngoài thủ thuật/thẩm mỹ đã có) ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Điều trị mụn trứng cá bằng peel', l.ma_loai_dich_vu, 'Theo liệu trình bác sĩ da liễu', 600000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Da liễu'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Điều trị mụn trứng cá bằng peel' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Điều trị nấm da, eczema', l.ma_loai_dich_vu, 'Khám và kê thuốc bôi/uống', 250000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Da liễu'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Điều trị nấm da, eczema' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== CHỈNH HÌNH ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tư vấn chỉnh hình thẩm mỹ', l.ma_loai_dich_vu, 'Tham vấn phương án can thiệp', 500000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chỉnh hình'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tư vấn chỉnh hình thẩm mỹ' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tiểu phẫu u mềm', l.ma_loai_dich_vu, 'Cắt bỏ u mỡ nhỏ tại phòng khám', 1500000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chỉnh hình'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tiểu phẫu u mềm' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== RĂNG HÀM MẶT ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Cạo vôi răng + đánh bóng', l.ma_loai_dich_vu, 'Vệ sinh răng miệng định kỳ', 300000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Răng hàm mặt'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Cạo vôi răng + đánh bóng' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Trám răng thẩm mỹ', l.ma_loai_dich_vu, 'Trám composite răng cửa/hàm nhỏ', 450000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Răng hàm mặt'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Trám răng thẩm mỹ' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Nhổ răng khôn đơn giản', l.ma_loai_dich_vu, 'Theo chỉ định và X-quang', 1200000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Răng hàm mặt'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Nhổ răng khôn đơn giản' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== CẤP CỨU Y TẾ ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Sơ cứu và xử trí cấp cứu ban đầu', l.ma_loai_dich_vu, 'Ổn định hô hấp, cầm máu, sốc nhẹ', 350000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Cấp cứu y tế'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Sơ cứu và xử trí cấp cứu ban đầu' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Tiêm truyền dịch tại phòng khám', l.ma_loai_dich_vu, 'Theo chỉ định bác sĩ', 250000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Cấp cứu y tế'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Tiêm truyền dịch tại phòng khám' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== CHĂM SÓC SỨC KHỎE TẠI NHÀ ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Y tá thăm khám tại nhà (nội thành)', l.ma_loai_dich_vu, 'Đo HA, đường huyết, thay băng đơn giản', 450000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chăm sóc sức khỏe tại nhà'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Y tá thăm khám tại nhà (nội thành)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Lấy máu xét nghiệm tại nhà', l.ma_loai_dich_vu, 'Theo chỉ định và gói xét nghiệm', 200000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Chăm sóc sức khỏe tại nhà'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Lấy máu xét nghiệm tại nhà' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== DỊCH VỤ Y TẾ CHUYÊN KHOA (bổ sung) ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Nội soi dạ dày không đau (gây tê)', l.ma_loai_dich_vu, 'Theo chỉ định và phác đồ gây tê', 3500000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Dịch vụ y tế chuyên khoa'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Nội soi dạ dày không đau (gây tê)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Đặt nội khí quản / can thiệp hô hấp (chuyên khoa)', l.ma_loai_dich_vu, 'Giá tham khảo — theo tình huống cấp cứu', 5000000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Dịch vụ y tế chuyên khoa'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Đặt nội khí quản / can thiệp hô hấp (chuyên khoa)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

-- ========== (Tuỳ chọn) Các dịch vụ “cốt lõi” bạn liệt kê — chỉ thêm nếu DB chưa có ==========
INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám tổng quát', l.ma_loai_dich_vu, 'Khám lâm sàng ban đầu, tư vấn hướng xử trí', 150000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám tổng quát' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám nội tổng quát', l.ma_loai_dich_vu, 'Khám chuyên khoa nội cho bệnh lý thường gặp', 200000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám nội tổng quát' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám nhi', l.ma_loai_dich_vu, 'Khám bệnh cho trẻ em', 180000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám nhi' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám tai mũi họng', l.ma_loai_dich_vu, 'Khám và tư vấn điều trị TMH', 220000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám tai mũi họng' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám da liễu', l.ma_loai_dich_vu, 'Khám các bệnh lý da liễu cơ bản', 220000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám da liễu' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Khám tái khám', l.ma_loai_dich_vu, 'Khám tái khám theo hẹn', 100000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Khám bệnh'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Khám tái khám' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Công thức máu (CBC)', l.ma_loai_dich_vu, 'Đánh giá hồng cầu, bạch cầu, tiểu cầu', 120000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Công thức máu (CBC)' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Đường huyết', l.ma_loai_dich_vu, 'Định lượng glucose máu', 70000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Xét nghiệm'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Đường huyết' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Thủ thuật da liễu', l.ma_loai_dich_vu, 'Tiểu phẫu loại bỏ u bã đậu, nốt ruồi, mụn thịt, sinh thiết da', 400000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Da liễu'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Thủ thuật da liễu' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Chăm sóc và Thẩm mỹ da', l.ma_loai_dich_vu, 'Laser điều trị sắc tố, xóa xăm, trẻ hóa da, điều trị sẹo, chăm sóc da chuyên sâu', 1000000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Da liễu'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Chăm sóc và Thẩm mỹ da' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);

INSERT INTO dich_vu (ten, ma_loai_dich_vu, mo_ta, gia, hoat_dong, tao_luc, cap_nhat_luc)
SELECT 'Dịch vụ lấy ráy tai', l.ma_loai_dich_vu, 'Lấy ráy tai an toàn tại phòng khám', 2000.00, 1, NOW(), NOW()
FROM loai_dich_vu l WHERE l.ten_loai_dich_vu = 'Dịch vụ y tế chuyên khoa'
AND NOT EXISTS (SELECT 1 FROM dich_vu d WHERE d.ten = 'Dịch vụ lấy ráy tai' AND d.ma_loai_dich_vu = l.ma_loai_dich_vu);
