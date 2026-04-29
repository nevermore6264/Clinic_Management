package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DangNhapYeuCau {
    @NotBlank
    private String tenDangNhap;
    @NotBlank
    private String matKhau;
}
