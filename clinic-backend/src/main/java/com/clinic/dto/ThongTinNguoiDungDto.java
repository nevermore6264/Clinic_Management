package com.clinic.dto;

import lombok.Data;

import java.util.Set;

@Data
public class ThongTinNguoiDungDto {
    private Long id;
    private String tenDangNhap;
    private String hoTen;
    private String thuDienTu;
    private String soDienThoai;
    private boolean hoatDong;
    private Set<String> cacVaiTro;
}
