package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CapNhatChuyenKhoaYeuCau {
    @NotBlank(message = "Tên chuyên khoa là bắt buộc")
    private String tenChuyenKhoa;
}
