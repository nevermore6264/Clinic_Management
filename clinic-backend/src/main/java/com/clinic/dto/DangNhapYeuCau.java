package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DangNhapYeuCau {
    @NotBlank
    private String tenDangNhap;
    @NotBlank
    private String matKhau;
}
