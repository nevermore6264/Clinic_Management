package com.clinic.config;

import java.security.Principal;

public record ChatPrincipal(long maNguoiDung, String tenDangNhap) implements Principal {

    @Override
    public String getName() {
        return tenDangNhap;
    }
}
