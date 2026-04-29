package com.clinic.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class NhatKyHeThongDto {
    private Long id;
    private String loaiThucThe;
    private Long maThucThe;
    private String hanhDong;
    private String giaTriCu;
    private String giaTriMoi;
    private Long maNguoiDung;
    private String tenDangNhap;
    private Instant taoLuc;
}
