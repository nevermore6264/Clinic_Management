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
    private boolean hoatDong;
}
