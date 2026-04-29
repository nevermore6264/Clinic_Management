package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoaiDichVuDto {
    private Long id;

    @NotBlank(message = "Tên loại dịch vụ không được để trống")
    private String tenLoaiDichVu;
}
