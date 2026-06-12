package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuenMatKhauYeuCau {
    @NotBlank
    private String dinhDanh;
}
