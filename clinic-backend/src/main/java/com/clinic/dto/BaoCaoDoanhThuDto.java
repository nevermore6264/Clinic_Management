package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BaoCaoDoanhThuDto {
    private LocalDate ngay;
    private BigDecimal tongDoanhThu;
    private Long soLichHen;
    private Long maBacSi;
    private String tenBacSi;
    private Long maDichVu;
    private String tenDichVu;
}
