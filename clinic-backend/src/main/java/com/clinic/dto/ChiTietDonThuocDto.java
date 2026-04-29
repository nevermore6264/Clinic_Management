package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChiTietDonThuocDto {
    private Long id;
    private Long maThuoc;
    private String tenThuoc;
    private Integer soLuong;
    private BigDecimal donGia;
    private String lieuDung;
}
