package com.clinic.dto;

import lombok.Data;

@Data
public class TaoBacSiYeuCau {
    /** Nếu null: tạo hồ sơ chỉ với {@link #hoTen} (không tài khoản đăng nhập). */
    private Long maNguoiDung;
    /** Bắt buộc khi {@link #maNguoiDung} null. */
    private String hoTen;
    private Long maChuyenKhoa;
    private String bangCap;
}
