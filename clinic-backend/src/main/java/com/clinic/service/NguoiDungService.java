package com.clinic.service;

import com.clinic.dto.TaoNguoiDungYeuCau;
import com.clinic.dto.ThongTinNguoiDungDto;
import com.clinic.dto.CapNhatNguoiDungYeuCau;
import com.clinic.entity.BacSi;
import com.clinic.entity.BenhNhan;
import com.clinic.entity.VaiTro;
import com.clinic.entity.NguoiDung;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.BenhNhanRepository;
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
    private final BenhNhanRepository benhNhanRepository;
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

        if (vaiTros.contains(VaiTro.BENH_NHAN)) {
            if (yeuCau.getMaBenhNhan() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn bệnh nhân để gán tài khoản.");
            }
            ganBenhNhanChoNguoiDung(nd, yeuCau.getMaBenhNhan());
        }
        if (vaiTros.contains(VaiTro.BAC_SI)) {
            if (yeuCau.getMaBacSi() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn bác sĩ (hồ sơ chưa có tài khoản) để gán.");
            }
            ganBacSiChoNguoiDung(nd, yeuCau.getMaBacSi());
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
        Set<VaiTro> cu = Set.copyOf(nd.getCacVaiTro());
        Set<VaiTro> moi = chuyenDoiVaiTro(yeuCau.getCacVaiTro());

        if (cu.contains(VaiTro.BENH_NHAN) && !moi.contains(VaiTro.BENH_NHAN)) {
            benhNhanRepository.findByNguoiDung_Id(nd.getId()).ifPresent(bn -> {
                bn.setNguoiDung(null);
                benhNhanRepository.save(bn);
            });
        }
        if (cu.contains(VaiTro.BAC_SI) && !moi.contains(VaiTro.BAC_SI)) {
            bacSiRepository.findByNguoiDung_Id(nd.getId()).ifPresent(bs -> {
                bs.setNguoiDung(null);
                bacSiRepository.save(bs);
            });
        }

        nd.setHoTen(yeuCau.getHoTen());
        nd.setThuDienTu(yeuCau.getThuDienTu());
        nd.setSoDienThoai(yeuCau.getSoDienThoai());
        nd.setCacVaiTro(moi);
        nd = nguoiDungRepository.save(nd);

        if (moi.contains(VaiTro.BENH_NHAN)) {
            if (yeuCau.getMaBenhNhan() == null) {
                if (benhNhanRepository.findByNguoiDung_Id(nd.getId()).isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn bệnh nhân để gán tài khoản.");
                }
            } else {
                ganBenhNhanChoNguoiDung(nd, yeuCau.getMaBenhNhan());
            }
        }
        if (moi.contains(VaiTro.BAC_SI)) {
            if (yeuCau.getMaBacSi() == null) {
                if (bacSiRepository.findByNguoiDung_Id(nd.getId()).isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn bác sĩ để gán tài khoản.");
                }
            } else {
                ganBacSiChoNguoiDung(nd, yeuCau.getMaBacSi());
            }
        }
        return sangDto(nd);
    }

    private void ganBenhNhanChoNguoiDung(NguoiDung nd, Long maBenhNhan) {
        benhNhanRepository.findByNguoiDung_Id(nd.getId()).ifPresent(bnCu -> {
            if (!bnCu.getId().equals(maBenhNhan)) {
                bnCu.setNguoiDung(null);
                benhNhanRepository.save(bnCu);
            }
        });
        BenhNhan bn = benhNhanRepository.findById(maBenhNhan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh nhân: " + maBenhNhan));
        if (bn.getNguoiDung() != null && !bn.getNguoiDung().getId().equals(nd.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bệnh nhân đã gán với tài khoản khác.");
        }
        bn.setNguoiDung(nd);
        benhNhanRepository.save(bn);
    }

    private void ganBacSiChoNguoiDung(NguoiDung nd, Long maBacSi) {
        bacSiRepository.findByNguoiDung_Id(nd.getId()).ifPresent(bsCu -> {
            if (!bsCu.getId().equals(maBacSi)) {
                bsCu.setNguoiDung(null);
                bacSiRepository.save(bsCu);
            }
        });
        BacSi bs = bacSiRepository.findById(maBacSi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bác sĩ: " + maBacSi));
        if (bs.getNguoiDung() != null && !bs.getNguoiDung().getId().equals(nd.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bác sĩ đã có tài khoản đăng nhập khác.");
        }
        bs.setNguoiDung(nd);
        if (bs.getHoTen() == null || bs.getHoTen().isBlank()) {
            bs.setHoTen(nd.getHoTen());
        }
        bacSiRepository.save(bs);
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
        benhNhanRepository.findByNguoiDung_Id(u.getId()).ifPresent(bn -> dto.setMaBenhNhan(bn.getId()));
        bacSiRepository.findByNguoiDung_Id(u.getId()).ifPresent(bs -> dto.setMaBacSi(bs.getId()));
        return dto;
    }
}
