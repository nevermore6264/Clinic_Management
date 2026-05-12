package com.clinic.service;

import com.clinic.dto.DangKyBenhNhanYeuCau;
import com.clinic.dto.DoiMatKhauYeuCau;
import com.clinic.dto.DangNhapYeuCau;
import com.clinic.dto.DangNhapPhanHoi;
import com.clinic.entity.BenhNhan;
import com.clinic.entity.NguoiDung;
import com.clinic.entity.VaiTro;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.BenhNhanRepository;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.security.JwtTienIch;
import com.clinic.security.NguoiDungChinhThuc;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumSet;

@Service
@RequiredArgsConstructor
public class XacThucService {

    private final AuthenticationManager quanLyXacThuc;
    private final JwtTienIch jwtTienIch;
    private final NguoiDungRepository nguoiDungRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final BacSiRepository bacSiRepository;
    private final PasswordEncoder maHoaMatKhau;

    @Transactional
    public DangNhapPhanHoi dangKyBenhNhan(DangKyBenhNhanYeuCau yeuCau) {
        String tenDn = yeuCau.getTenDangNhap() != null ? yeuCau.getTenDangNhap().trim() : "";
        if (tenDn.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đăng nhập là bắt buộc");
        }
        if (nguoiDungRepository.existsByTenDangNhap(tenDn)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại");
        }
        String hoTen = yeuCau.getHoTen() != null ? yeuCau.getHoTen().trim() : "";
        if (hoTen.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên là bắt buộc");
        }
        String mk = yeuCau.getMatKhau();
        if (mk == null || mk.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cần tối thiểu 6 ký tự");
        }
        String sdt = chuoiRongNeuChiLaKhoangTrang(yeuCau.getSoDienThoai());
        String email = chuoiRongNeuChiLaKhoangTrang(yeuCau.getThuDienTu());

        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap(tenDn);
        nd.setMatKhauBam(maHoaMatKhau.encode(mk));
        nd.setHoTen(hoTen);
        nd.setSoDienThoai(sdt);
        nd.setThuDienTu(email);
        nd.setCacVaiTro(EnumSet.of(VaiTro.BENH_NHAN));
        nd.setHoatDong(true);
        nd = nguoiDungRepository.save(nd);

        BenhNhan bn = new BenhNhan();
        bn.setHoTen(hoTen);
        bn.setSoDienThoai(sdt);
        bn.setThuDienTu(email);
        bn.setNguoiDung(nd);
        bn.setHoatDong(true);
        benhNhanRepository.save(bn);

        return dangNhap(new DangNhapYeuCau(tenDn, mk));
    }

    private static String chuoiRongNeuChiLaKhoangTrang(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    public DangNhapPhanHoi dangNhap(DangNhapYeuCau yeuCau) {
        Authentication ketQua = quanLyXacThuc.authenticate(
                new UsernamePasswordAuthenticationToken(yeuCau.getTenDangNhap(), yeuCau.getMatKhau()));
        NguoiDungChinhThuc chuThe = (NguoiDungChinhThuc) ketQua.getPrincipal();
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(chuThe.getUsername()).orElseThrow();
        Long maBenhNhan = benhNhanRepository.findByNguoiDung_Id(nguoiDung.getId())
                .map(b -> b.getId())
                .orElse(null);
        Long maBacSi = bacSiRepository.findByNguoiDung_Id(nguoiDung.getId())
                .map(bs -> bs.getId())
                .orElse(null);
        return DangNhapPhanHoi.builder()
                .token(jwtTienIch.taoToken(ketQua))
                .tenDangNhap(nguoiDung.getTenDangNhap())
                .hoTen(nguoiDung.getHoTen())
                .cacVaiTro(chuThe.layCacTenVaiTro())
                .maNguoiDung(nguoiDung.getId())
                .maBenhNhan(maBenhNhan)
                .maBacSi(maBacSi)
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
