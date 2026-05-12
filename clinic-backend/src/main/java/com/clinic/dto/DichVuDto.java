package com.clinic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DichVuDto {
    private Long id;
    private Long maLoaiDichVu;
    private String tenLoaiDichVu;
    @NotNull(message = "Vui lòng chọn chuyên khoa.")
    private Long maChuyenKhoa;
    private String tenChuyenKhoa;
    private String ten;
    private String moTa;
    private BigDecimal gia;
    private boolean hoatDong;
}
