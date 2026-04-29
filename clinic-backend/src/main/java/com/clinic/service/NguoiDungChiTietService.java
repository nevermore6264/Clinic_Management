package com.clinic.service;

import com.clinic.entity.NguoiDung;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.security.NguoiDungChinhThuc;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NguoiDungChiTietService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    public UserDetails loadUserByUsername(String tenDangNhap) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(tenDangNhap)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy: " + tenDangNhap));
        if (!nguoiDung.isHoatDong()) {
            throw new UsernameNotFoundException("Tài khoản đã tắt");
        }
        return NguoiDungChinhThuc.tu(nguoiDung);
    }
}
