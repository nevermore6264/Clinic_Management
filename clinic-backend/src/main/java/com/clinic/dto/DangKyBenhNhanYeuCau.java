package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DangKyBenhNhanYeuCau {
    @NotBlank(message = "Tên đăng nhập là bắt buộc")
    private String tenDangNhap;

    @NotBlank(message = "Mật khẩu là bắt buộc")
    @Size(min = 6, message = "Mật khẩu cần tối thiểu 6 ký tự")
    private String matKhau;

    @NotBlank(message = "Họ tên là bắt buộc")
    private String hoTen;

    private String thuDienTu;
    private String soDienThoai;
}
