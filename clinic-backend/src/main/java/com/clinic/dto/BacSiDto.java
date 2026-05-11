package com.clinic.dto;

import lombok.Data;

@Data
public class BacSiDto {
    private Long id;
    private Long maNguoiDung;
    private String tenDangNhap;
    private String hoTen;
    private Long maChuyenKhoa;
    private String tenChuyenKhoa;
    private String bangCap;
    private String gioiThieu;
    private String quaTrinhCongTac;
    private String thanhTichDatDuoc;
    private boolean hoatDong;
}
