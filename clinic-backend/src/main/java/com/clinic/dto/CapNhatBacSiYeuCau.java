package com.clinic.dto;

import lombok.Data;

@Data
public class CapNhatBacSiYeuCau {
    private Long maChuyenKhoa;
    private String bangCap;
    private boolean hoatDong;
    /** Chỉ áp dụng khi bác sĩ chưa gắn tài khoản. */
    private String hoTen;
}
