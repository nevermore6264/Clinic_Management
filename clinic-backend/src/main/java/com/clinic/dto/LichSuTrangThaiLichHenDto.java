package com.clinic.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class LichSuTrangThaiLichHenDto {
    private Long id;
    private Long maLichHen;
    private String trangThaiCu;
    private String trangThaiMoi;
    private Long maNguoiDung;
    private String tenDangNhap;
    private String ghiChu;
    private Instant taoLuc;
}
