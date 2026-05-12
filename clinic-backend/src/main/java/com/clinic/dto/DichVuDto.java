package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DichVuDto {
    private Long id;
    private Long maLoaiDichVu;
    private String tenLoaiDichVu;
    private Long maChuyenKhoa;
    private String tenChuyenKhoa;
    private String ten;
    private String moTa;
    private BigDecimal gia;
    private boolean hoatDong;
}
