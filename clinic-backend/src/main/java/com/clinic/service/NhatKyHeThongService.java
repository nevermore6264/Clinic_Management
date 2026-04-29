package com.clinic.service;

import com.clinic.dto.NhatKyHeThongDto;
import com.clinic.entity.NhatKyHeThong;
import com.clinic.repository.NhatKyHeThongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.clinic.security.NguoiDungChinhThuc;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NhatKyHeThongService {

    private final NhatKyHeThongRepository khoNhatKy;

    @Transactional(readOnly = true)
    public Page<NhatKyHeThongDto> timTheoKhoangThoiGian(Instant tuLuc, Instant denLuc, Pageable phanTrang) {
        return khoNhatKy.findByTaoLucBetweenOrderByTaoLucDesc(tuLuc, denLuc, phanTrang)
                .map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public Page<NhatKyHeThongDto> timTheoMaNguoiDung(Long maNguoiDung, Pageable phanTrang) {
        return khoNhatKy.findByMaNguoiDungOrderByTaoLucDesc(maNguoiDung, phanTrang)
                .map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public Page<NhatKyHeThongDto> timTheoThucThe(String loaiThucThe, Long maThucThe, Pageable phanTrang) {
        return khoNhatKy.findByLoaiThucTheAndMaThucThe(loaiThucThe, maThucThe, phanTrang)
                .map(this::sangDto);
    }

    @Transactional
    public void ghi(String loaiThucThe, Long maThucThe, String hanhDong, String giaTriCu, String giaTriMoi) {
        Long maNguoiDung = null;
        String tenDangNhap = null;
        Authentication xacThuc = SecurityContextHolder.getContext().getAuthentication();
        if (xacThuc != null && xacThuc.getPrincipal() instanceof NguoiDungChinhThuc p) {
            maNguoiDung = p.getMaNguoiDung();
            tenDangNhap = p.getUsername();
        }
        NhatKyHeThong dong = NhatKyHeThong.builder()
                .loaiThucThe(loaiThucThe)
                .maThucThe(maThucThe)
                .hanhDong(hanhDong)
                .giaTriCu(giaTriCu != null && giaTriCu.length() > 2000 ? giaTriCu.substring(0, 2000) : giaTriCu)
                .giaTriMoi(giaTriMoi != null && giaTriMoi.length() > 2000 ? giaTriMoi.substring(0, 2000) : giaTriMoi)
                .maNguoiDung(maNguoiDung)
                .tenDangNhap(tenDangNhap)
                .taoLuc(Instant.now())
                .build();
        khoNhatKy.save(dong);
    }

    private NhatKyHeThongDto sangDto(NhatKyHeThong nk) {
        NhatKyHeThongDto dto = new NhatKyHeThongDto();
        dto.setId(nk.getId());
        dto.setLoaiThucThe(nk.getLoaiThucThe());
        dto.setMaThucThe(nk.getMaThucThe());
        dto.setHanhDong(nk.getHanhDong());
        dto.setGiaTriCu(nk.getGiaTriCu());
        dto.setGiaTriMoi(nk.getGiaTriMoi());
        dto.setMaNguoiDung(nk.getMaNguoiDung());
        dto.setTenDangNhap(nk.getTenDangNhap());
        dto.setTaoLuc(nk.getTaoLuc());
        return dto;
    }
}
