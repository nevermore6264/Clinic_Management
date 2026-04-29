package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoiMatKhauYeuCau {
    @NotBlank
    private String matKhauHienTai;
    @NotBlank
    private String matKhauMoi;
}
