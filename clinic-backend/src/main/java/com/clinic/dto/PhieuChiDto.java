package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
public class PhieuChiDto {
    private Long id;
    @NotBlank
    private String moTa;
    @NotNull
    private BigDecimal soTien;
    private LocalDate ngayChi;
    private String loai;
    private Long maNguoiTao;
    private String tenDangNhapNguoiTao;
    private Instant taoLuc;
}
