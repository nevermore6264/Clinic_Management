package com.clinic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaoBacSiYeuCau {
    @NotNull(message = "maNguoiDung là bắt buộc")
    private Long maNguoiDung;
    private Long maChuyenKhoa;
    private String bangCap;
}
