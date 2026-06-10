package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChiTietDichVuKhamDto {
    private Long id;
    private Long maDichVu;
    private String tenDichVu;
    private String tenLoaiDichVu;
    private Integer soLuong;
    private BigDecimal donGia;
}
