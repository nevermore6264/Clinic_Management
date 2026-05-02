-- Mo rong thong tin benh nhan (MySQL 8+)
-- Chay script nay neu CSDL hien tai chua duoc Hibernate tu dong tao cot.

ALTER TABLE benh_nhan
    ADD COLUMN IF NOT EXISTS gioi_tinh VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS so_cccd VARCHAR(32) NULL,
    ADD COLUMN IF NOT EXISTS nghe_nghiep VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS nhom_mau VARCHAR(10) NULL,
    ADD COLUMN IF NOT EXISTS tien_su_benh TEXT NULL,
    ADD COLUMN IF NOT EXISTS di_ung TEXT NULL,
    ADD COLUMN IF NOT EXISTS nguoi_lien_he VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS so_dien_thoai_lien_he VARCHAR(32) NULL;
