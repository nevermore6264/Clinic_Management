package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DatLaiMatKhauYeuCau {
    @NotBlank
    private String token;
    @NotBlank
    private String matKhauMoi;
}
