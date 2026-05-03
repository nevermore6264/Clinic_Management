package com.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DangNhapPhanHoi {
    private String token;
    private String tenDangNhap;
    private String hoTen;
    private Set<String> cacVaiTro;
    private Long maNguoiDung;
    /** Mã hồ sơ bệnh nhân khi tài khoản được liên kết (vai trò BENH_NHAN). */
    private Long maBenhNhan;
}
