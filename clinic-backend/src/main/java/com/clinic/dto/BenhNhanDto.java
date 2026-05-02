package com.clinic.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BenhNhanDto {
    private Long id;
    private String hoTen;
    private LocalDate ngaySinh;
    private String soDienThoai;
    private String diaChi;
    private String thuDienTu;
    private String gioiTinh;
    private String soCccd;
    private String ngheNghiep;
    private String nhomMau;
    private String tienSuBenh;
    private String diUng;
    private String nguoiLienHe;
    private String soDienThoaiLienHe;
    private boolean hoatDong;
}
