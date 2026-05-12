-- Đồng bộ bảng benh_nhan theo export a.csv.
-- Địa chỉ, SĐT, email: đúng theo CSV gốc; ô trống trong CSV = NULL (không dùng placeholder).
-- hoat_dong: bit(1) — dùng b'1'.
-- KHÔNG cập nhật cột ma_nguoi_dung (giữ nguyên trong DB; tránh gán tài khoản giả).

SET NAMES utf8mb4;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-02 13:48:23.068661',
  `dia_chi` = '303 Lưu Văn Lang Hoà Hải Ngũ Hành Sơn Đà Nẵng',
  `ho_ten` = 'Nguyễn Văn Hiếu',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1997-03-14',
  `so_dien_thoai` = '0862478150',
  `tao_luc` = '2026-04-30 22:01:26.103552',
  `thu_dien_tu` = 'hieupikas2606@gmail.com',
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Nhân viên văn phòng',
  `nguoi_lien_he` = 'Tướng Thị Quế',
  `nhom_mau` = 'A',
  `so_cccd` = '168570382',
  `so_dien_thoai_lien_he` = '0364982843',
  `tien_su_benh` = 'Không'
WHERE `id` = 1;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-02 18:30:01.762705',
  `dia_chi` = '119 Trần Phú, Hải Châu 1, Hải Châu, Đà Nẵng',
  `ho_ten` = 'Nguyễn Văn Quý',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1988-11-02',
  `so_dien_thoai` = '0364982843',
  `tao_luc` = '2026-04-30 22:01:43.511145',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Lái xe',
  `nguoi_lien_he` = 'Người nhà (chưa cập nhật chi tiết)',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 2;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-02 18:30:09.078467',
  `dia_chi` = '290 Hùng Vương, Vĩnh Trung, Hải Châu, Đà Nẵng',
  `ho_ten` = 'Phạm Văn Khoa',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1991-07-15',
  `so_dien_thoai` = '0984452108',
  `tao_luc` = '2026-04-30 22:26:51.825181',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Kinh doanh',
  `nguoi_lien_he` = 'Người nhà (chưa cập nhật chi tiết)',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 3;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 11:22:25.080740',
  `dia_chi` = 'Số 24 Trần Phú, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
  `ho_ten` = 'Tướng Thị Quế',
  `hoat_dong` = b'1',
  `ngay_sinh` = '2004-06-20',
  `so_dien_thoai` = '0364982843',
  `tao_luc` = '2026-05-11 06:52:46.529828',
  `thu_dien_tu` = 'nevermore6264@gmail.com',
  `di_ung` = 'Hải sản, đậu phộng, trứng, sữa.',
  `gioi_tinh` = 'NU',
  `nghe_nghiep` = 'Thu ngân siêu thị',
  `nguoi_lien_he` = 'Tướng Chí Vỹ',
  `nhom_mau` = 'A',
  `so_cccd` = '168570382',
  `so_dien_thoai_lien_he` = '0984452108',
  `tien_su_benh` = 'Cao huyết áp, đái tháo đường, bệnh tim mạch, hen suyễn, bệnh gan/thận....Thời gian phát hiện và phương pháp điều trị.'
WHERE `id` = 4;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:51:43.663492',
  `dia_chi` = '6 Nại Nam, Hòa Cường Bắc, Hải Châu, Đà Nẵng',
  `ho_ten` = 'Trần Văn Vinh',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1994-01-20',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:51:43.663492',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Lao động tự do',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 5;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:51:55.050083',
  `dia_chi` = '257 Hùng Vương, Vĩnh Trung, Thanh Khê, Đà Nẵng',
  `ho_ten` = 'Nguyễn Văn Thoại',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1993-09-08',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:51:55.050083',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Công nhân',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 6;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:52:03.792738',
  `dia_chi` = 'Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng',
  `ho_ten` = 'Đào Văn Dũng',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1992-04-12',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:52:03.792738',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Nhân viên văn phòng',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 7;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:52:15.624951',
  `dia_chi` = NULL,
  `ho_ten` = 'Nguyễn Đăng Hải Hoàng',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1996-12-01',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:52:15.624951',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Học sinh / sinh viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 8;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:55:41.551791',
  `dia_chi` = NULL,
  `ho_ten` = 'Ngô Văn Đức',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1995-03-18',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:55:41.551791',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Lao động tự do',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 9;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:55:55.855485',
  `dia_chi` = NULL,
  `ho_ten` = 'Chế Văn Hoàng',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1990-08-25',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:55:55.855485',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Kỹ thuật viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 10;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:58:23.665901',
  `dia_chi` = NULL,
  `ho_ten` = 'Lương Ngọc Hùng',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1993-06-14',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:58:23.665901',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Kinh doanh',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 11;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 07:59:58.471664',
  `dia_chi` = NULL,
  `ho_ten` = 'Bùi Thị Minh Quý',
  `hoat_dong` = b'1',
  `ngay_sinh` = '2001-02-28',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 07:59:58.471664',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NU',
  `nghe_nghiep` = 'Nhân viên văn phòng',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 12;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:33:10.721294',
  `dia_chi` = NULL,
  `ho_ten` = 'Trần Võ Thành Nhân',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1997-10-05',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:33:10.721294',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Lao động tự do',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 13;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:33:33.943842',
  `dia_chi` = NULL,
  `ho_ten` = 'Lưu Diệp Phàm',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1994-11-30',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:33:33.943842',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Lao động tự do',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 14;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:33:48.490868',
  `dia_chi` = NULL,
  `ho_ten` = 'Âu Chúc Thanh Phương',
  `hoat_dong` = b'1',
  `ngay_sinh` = '2000-05-22',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:33:48.490868',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NU',
  `nghe_nghiep` = 'Học sinh / sinh viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 15;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:33:57.828628',
  `dia_chi` = NULL,
  `ho_ten` = 'Nghệ Mạn Thiên',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1998-07-07',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:33:57.828628',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'KHAC',
  `nghe_nghiep` = 'Lao động tự do',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 16;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:34:07.669735',
  `dia_chi` = NULL,
  `ho_ten` = 'Lưu Văn Châu Kỳ',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1991-01-16',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:34:07.669735',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Công nhân',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 17;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:34:59.760996',
  `dia_chi` = NULL,
  `ho_ten` = 'Phạm Thiên Kim',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1999-04-09',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:34:59.760996',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NU',
  `nghe_nghiep` = 'Nhân viên văn phòng',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 18;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:35:30.359600',
  `dia_chi` = NULL,
  `ho_ten` = 'Phạm Ngọc Mai',
  `hoat_dong` = b'1',
  `ngay_sinh` = '2002-08-19',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:35:30.359600',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NU',
  `nghe_nghiep` = 'Học sinh / sinh viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 19;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:35:37.447585',
  `dia_chi` = NULL,
  `ho_ten` = 'Nguyễn Uyển Dư',
  `hoat_dong` = b'1',
  `ngay_sinh` = '2003-03-03',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:35:37.447585',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NU',
  `nghe_nghiep` = 'Học sinh / sinh viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 20;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:35:44.396580',
  `dia_chi` = NULL,
  `ho_ten` = 'Hồ Hiếu An',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1996-06-21',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:35:44.396580',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Nhân viên văn phòng',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 21;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:35:51.454748',
  `dia_chi` = NULL,
  `ho_ten` = 'Lý Đăng Khoa',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1995-12-12',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:35:51.454748',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Kỹ thuật viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 22;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:35:58.828435',
  `dia_chi` = NULL,
  `ho_ten` = 'Trần Thanh Phong',
  `hoat_dong` = b'1',
  `ngay_sinh` = '1992-02-02',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:35:58.828435',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Kinh doanh',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 23;

UPDATE `benh_nhan` SET
  `cap_nhat_luc` = '2026-05-11 19:36:17.549329',
  `dia_chi` = NULL,
  `ho_ten` = 'Nguyễn Anh Khôi',
  `hoat_dong` = b'1',
  `ngay_sinh` = '2010-11-11',
  `so_dien_thoai` = NULL,
  `tao_luc` = '2026-05-11 19:36:17.549329',
  `thu_dien_tu` = NULL,
  `di_ung` = 'Không',
  `gioi_tinh` = 'NAM',
  `nghe_nghiep` = 'Học sinh / sinh viên',
  `nguoi_lien_he` = 'Chưa cập nhật',
  `nhom_mau` = 'O',
  `so_cccd` = NULL,
  `so_dien_thoai_lien_he` = NULL,
  `tien_su_benh` = 'Không'
WHERE `id` = 24;
