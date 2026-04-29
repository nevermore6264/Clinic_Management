package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ThuocDto {
    private Long id;
    @NotBlank
    private String tenThuoc;
    private String donVi;
    private String hoatChat;
    private BigDecimal giaBan;
    private boolean hoatDong;
}
