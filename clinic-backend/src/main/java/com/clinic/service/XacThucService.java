package com.clinic.service;

import com.clinic.dto.DoiMatKhauYeuCau;
import com.clinic.dto.DangNhapYeuCau;
import com.clinic.dto.DangNhapPhanHoi;
import com.clinic.entity.NguoiDung;
import com.clinic.repository.BenhNhanRepository;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.security.JwtTienIch;
import com.clinic.security.NguoiDungChinhThuc;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class XacThucService {

    private final AuthenticationManager quanLyXacThuc;
    private final JwtTienIch jwtTienIch;
    private final NguoiDungRepository nguoiDungRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final PasswordEncoder maHoaMatKhau;

    public DangNhapPhanHoi dangNhap(DangNhapYeuCau yeuCau) {
        Authentication ketQua = quanLyXacThuc.authenticate(
                new UsernamePasswordAuthenticationToken(yeuCau.getTenDangNhap(), yeuCau.getMatKhau()));
        NguoiDungChinhThuc chuThe = (NguoiDungChinhThuc) ketQua.getPrincipal();
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(chuThe.getUsername()).orElseThrow();
        Long maBenhNhan = benhNhanRepository.findByNguoiDung_Id(nguoiDung.getId())
                .map(b -> b.getId())
                .orElse(null);
        return DangNhapPhanHoi.builder()
                .token(jwtTienIch.taoToken(ketQua))
                .tenDangNhap(nguoiDung.getTenDangNhap())
                .hoTen(nguoiDung.getHoTen())
                .cacVaiTro(chuThe.layCacTenVaiTro())
                .maNguoiDung(nguoiDung.getId())
                .maBenhNhan(maBenhNhan)
                .build();
    }

    public void doiMatKhau(DoiMatKhauYeuCau yeuCau) {
        String ten = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(ten)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (!maHoaMatKhau.matches(yeuCau.getMatKhauHienTai(), nguoiDung.getMatKhauBam())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        nguoiDung.setMatKhauBam(maHoaMatKhau.encode(yeuCau.getMatKhauMoi()));
        nguoiDungRepository.save(nguoiDung);
    }
}
