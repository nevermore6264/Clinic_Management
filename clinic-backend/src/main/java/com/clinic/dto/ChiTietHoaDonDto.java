package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChiTietHoaDonDto {
    private Long id;
    private Long maDichVu;
    private String tenDichVu;
    private BigDecimal donGia;
    private Integer soLuong;
    private BigDecimal thanhTien;
}
