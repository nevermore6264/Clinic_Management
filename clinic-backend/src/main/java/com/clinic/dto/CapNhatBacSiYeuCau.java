package com.clinic.dto;

import lombok.Data;

@Data
public class CapNhatBacSiYeuCau {
    private Long maChuyenKhoa;
    private String bangCap;
    private boolean hoatDong;
    private String hoTen;
    private String gioiThieu;
    private String quaTrinhCongTac;
    private String thanhTichDatDuoc;
}
