package com.clinic.security;

import com.clinic.entity.NguoiDung;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@AllArgsConstructor
public class NguoiDungChinhThuc implements UserDetails {

    private final Long id;
    private final String tenDangNhap;
    private final String matKhauBam;
    private final Collection<? extends GrantedAuthority> quyen;

    public static NguoiDungChinhThuc tu(NguoiDung nguoiDung) {
        var quyen = nguoiDung.getCacVaiTro().stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                .collect(Collectors.toList());
        return new NguoiDungChinhThuc(
                nguoiDung.getId(),
                nguoiDung.getTenDangNhap(),
                nguoiDung.getMatKhauBam(),
                quyen
        );
    }

    public Long getMaNguoiDung() {
        return id;
    }

    public Set<String> layCacTenVaiTro() {
        return quyen.stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toSet());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return quyen;
    }

    @Override
    public String getPassword() {
        return matKhauBam;
    }

    @Override
    public String getUsername() {
        return tenDangNhap;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
