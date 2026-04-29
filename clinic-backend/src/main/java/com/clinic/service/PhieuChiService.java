package com.clinic.service;

import com.clinic.dto.PhieuChiDto;
import com.clinic.entity.PhieuChi;
import com.clinic.repository.PhieuChiRepository;
import com.clinic.security.NguoiDungChinhThuc;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PhieuChiService {

    private final PhieuChiRepository phieuChiRepository;

    @Transactional(readOnly = true)
    public Page<PhieuChiDto> timTheoKhoang(LocalDate tuNgay, LocalDate denNgay, Pageable phanTrang) {
        if (tuNgay != null && denNgay != null) {
            return phieuChiRepository.findByNgayChiBetweenOrderByNgayChiDesc(tuNgay, denNgay, phanTrang)
                    .map(this::sangDto);
        }
        Pageable coSapXep = PageRequest.of(
                phanTrang.getPageNumber(),
                phanTrang.getPageSize(),
                Sort.by(Sort.Direction.DESC, "ngayChi"));
        return phieuChiRepository.findAll(coSapXep).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public PhieuChiDto layTheoMa(Long id) {
        return sangDto(phieuChiRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu chi: " + id)));
    }

    @Transactional
    public PhieuChiDto tao(PhieuChiDto dto) {
        PhieuChi.LoaiPhieuChi loai = parseLoai(dto.getLoai());
        Long maNd = null;
        String tenDn = null;
        Authentication xacThuc = SecurityContextHolder.getContext().getAuthentication();
        if (xacThuc != null && xacThuc.getPrincipal() instanceof NguoiDungChinhThuc p) {
            maNd = p.getMaNguoiDung();
            tenDn = p.getUsername();
        }
        PhieuChi pc = PhieuChi.builder()
                .moTa(dto.getMoTa())
                .soTien(dto.getSoTien())
                .ngayChi(dto.getNgayChi() != null ? dto.getNgayChi() : LocalDate.now())
                .loai(loai)
                .maNguoiTao(maNd)
                .tenDangNhapNguoiTao(tenDn)
                .build();
        return sangDto(phieuChiRepository.save(pc));
    }

    @Transactional
    public PhieuChiDto capNhat(Long id, PhieuChiDto dto) {
        PhieuChi pc = phieuChiRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu chi: " + id));
        pc.setMoTa(dto.getMoTa());
        pc.setSoTien(dto.getSoTien());
        if (dto.getNgayChi() != null) pc.setNgayChi(dto.getNgayChi());
        if (dto.getLoai() != null) pc.setLoai(parseLoai(dto.getLoai()));
        return sangDto(phieuChiRepository.save(pc));
    }

    @Transactional
    public void xoa(Long id) {
        phieuChiRepository.deleteById(id);
    }

    private static PhieuChi.LoaiPhieuChi parseLoai(String loai) {
        if (loai == null || loai.isBlank()) return PhieuChi.LoaiPhieuChi.KHAC;
        try {
            return PhieuChi.LoaiPhieuChi.valueOf(loai.trim());
        } catch (IllegalArgumentException e) {
            return PhieuChi.LoaiPhieuChi.KHAC;
        }
    }

    private PhieuChiDto sangDto(PhieuChi pc) {
        PhieuChiDto dto = new PhieuChiDto();
        dto.setId(pc.getId());
        dto.setMoTa(pc.getMoTa());
        dto.setSoTien(pc.getSoTien());
        dto.setNgayChi(pc.getNgayChi());
        dto.setLoai(pc.getLoai() != null ? pc.getLoai().name() : null);
        dto.setMaNguoiTao(pc.getMaNguoiTao());
        dto.setTenDangNhapNguoiTao(pc.getTenDangNhapNguoiTao());
        dto.setTaoLuc(pc.getTaoLuc());
        return dto;
    }
}
