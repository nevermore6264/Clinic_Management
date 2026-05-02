package com.clinic.service;

import com.clinic.dto.TaoNguoiDungYeuCau;
import com.clinic.dto.ThongTinNguoiDungDto;
import com.clinic.dto.CapNhatNguoiDungYeuCau;
import com.clinic.entity.BacSi;
import com.clinic.entity.VaiTro;
import com.clinic.entity.NguoiDung;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final BacSiRepository bacSiRepository;
    private final PasswordEncoder maHoaMatKhau;

    @Transactional(readOnly = true)
    public List<ThongTinNguoiDungDto> timTatCa() {
        return nguoiDungRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional
    public ThongTinNguoiDungDto tao(TaoNguoiDungYeuCau yeuCau) {
        if (nguoiDungRepository.existsByTenDangNhap(yeuCau.getTenDangNhap())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại");
        }
        Set<VaiTro> vaiTros = chuyenDoiVaiTro(yeuCau.getCacVaiTro());
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap(yeuCau.getTenDangNhap());
        nd.setMatKhauBam(maHoaMatKhau.encode(yeuCau.getMatKhau()));
        nd.setHoTen(yeuCau.getHoTen());
        nd.setThuDienTu(yeuCau.getThuDienTu());
        nd.setSoDienThoai(yeuCau.getSoDienThoai());
        nd.setCacVaiTro(vaiTros);
        nd.setHoatDong(true);
        nd = nguoiDungRepository.save(nd);
        if (vaiTros.contains(VaiTro.BAC_SI)) {
            BacSi bs = new BacSi();
            bs.setNguoiDung(nd);
            bacSiRepository.save(bs);
        }
        return sangDto(nd);
    }

    @Transactional
    public ThongTinNguoiDungDto capNhat(Long id, CapNhatNguoiDungYeuCau yeuCau) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng: " + id
                ));
        nd.setHoTen(yeuCau.getHoTen());
        nd.setThuDienTu(yeuCau.getThuDienTu());
        nd.setSoDienThoai(yeuCau.getSoDienThoai());
        nd.setCacVaiTro(chuyenDoiVaiTro(yeuCau.getCacVaiTro()));
        return sangDto(nguoiDungRepository.save(nd));
    }

    @Transactional
    public void khoaTaiKhoan(Long id) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng: " + id
                ));
        nd.setHoatDong(false);
        nguoiDungRepository.save(nd);
    }

    @Transactional
    public void moKhoaTaiKhoan(Long id) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng: " + id
                ));
        nd.setHoatDong(true);
        nguoiDungRepository.save(nd);
    }

    private Set<VaiTro> chuyenDoiVaiTro(Set<String> danhSachVaiTro) {
        if (danhSachVaiTro == null || danhSachVaiTro.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách vai trò không hợp lệ");
        }
        try {
            Set<VaiTro> vaiTros = danhSachVaiTro.stream()
                    .map(String::trim)
                    .filter(vaiTro -> !vaiTro.isEmpty())
                    .map(String::toUpperCase)
                    .map(VaiTro::valueOf)
                    .collect(Collectors.toSet());
            if (vaiTros.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách vai trò không hợp lệ");
            }
            return vaiTros;
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò không hợp lệ", ex);
        }
    }

    private ThongTinNguoiDungDto sangDto(NguoiDung u) {
        ThongTinNguoiDungDto dto = new ThongTinNguoiDungDto();
        dto.setId(u.getId());
        dto.setTenDangNhap(u.getTenDangNhap());
        dto.setHoTen(u.getHoTen());
        dto.setThuDienTu(u.getThuDienTu());
        dto.setSoDienThoai(u.getSoDienThoai());
        dto.setHoatDong(u.isHoatDong());
        dto.setCacVaiTro(u.getCacVaiTro().stream().map(Enum::name).collect(Collectors.toSet()));
        return dto;
    }
}
