package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class CapNhatNguoiDungYeuCau {
    @NotBlank
    private String hoTen;
    private String thuDienTu;
    private String soDienThoai;
    @NotEmpty
    private Set<String> cacVaiTro;
}
