package com.clinic.service;

import com.clinic.dto.LichHenDto;
import com.clinic.entity.*;
import com.clinic.repository.*;
import com.clinic.security.NguoiDungChinhThuc;
import com.clinic.security.QuyenTruyCapHoSoBenhNhan;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichHenService {

    private final LichHenRepository lichHenRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final BacSiRepository bacSiRepository;
    private final DichVuRepository dichVuRepository;
    private final LichSuTrangThaiLichHenRepository lichSuTrangThaiLichHenRepository;
    private final QuyenTruyCapHoSoBenhNhan quyenTruyCapHoSoBenhNhan;

    @Transactional(readOnly = true)
    public Page<LichHenDto> timTrongKhoang(LocalDate tuNgay, LocalDate denNgay, Pageable phanTrang) {
        return lichHenRepository.findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(tuNgay, denNgay, phanTrang)
                .map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public List<LichHenDto> timTheoBenhNhan(Long maBenhNhan) {
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(maBenhNhan);
        return lichHenRepository.findByBenhNhanIdOrderByNgayHenDescGioHenDesc(maBenhNhan, Pageable.ofSize(50)).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LichHenDto> timTheoBacSiVaNgay(Long maBacSi, LocalDate ngay) {
        return lichHenRepository.findByBacSiIdAndNgayHenOrderByGioHen(maBacSi, ngay).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LichHenDto layTheoMa(Long ma) {
        LichHen lh = lichHenRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + ma));
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(lh.getBenhNhan().getId());
        return sangDto(lh);
    }

    @Transactional
    public LichHenDto tao(LichHenDto dto) {
        if (!quyenTruyCapHoSoBenhNhan.laNhanVien()) {
            Long lienKet = quyenTruyCapHoSoBenhNhan.layMaBenhNhanLienKetVoiTaiKhoan()
                    .orElseThrow(() -> new AccessDeniedException("Tài khoản chưa được liên kết hồ sơ bệnh nhân."));
            if (!lienKet.equals(dto.getMaBenhNhan())) {
                throw new AccessDeniedException("Chỉ được đặt lịch cho chính mình.");
            }
        }
        if (coTrung(dto.getMaBacSi(), dto.getNgayHen(), dto.getGioHen(), null)) {
            throw new RuntimeException("Trùng lịch khám với bác sĩ tại thời điểm này.");
        }
        LichHen lh = new LichHen();
        lh.setBenhNhan(benhNhanRepository.findById(dto.getMaBenhNhan()).orElseThrow());
        lh.setBacSi(bacSiRepository.findById(dto.getMaBacSi()).orElseThrow());
        lh.setDichVu(dichVuRepository.findById(dto.getMaDichVu()).orElseThrow());
        lh.setNgayHen(dto.getNgayHen());
        lh.setGioHen(dto.getGioHen());
        lh.setGhiChu(dto.getGhiChu());
        return sangDto(lichHenRepository.save(lh));
    }

    @Transactional
    public LichHenDto capNhatTrangThai(Long ma, LichHen.TrangThaiLichHen trangThai) {
        LichHen lh = lichHenRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + ma));
        LichHen.TrangThaiLichHen cu = lh.getTrangThai();
        if (cu == trangThai) {
            return sangDto(lh);
        }
        lh.setTrangThai(trangThai);
        LichHen daLuu = lichHenRepository.save(lh);
        ghiLichSuTrangThai(daLuu, cu, trangThai);
        return sangDto(daLuu);
    }

    private void ghiLichSuTrangThai(LichHen lichHen, LichHen.TrangThaiLichHen cu, LichHen.TrangThaiLichHen moi) {
        Long maNd = null;
        String tenDn = null;
        Authentication xacThuc = SecurityContextHolder.getContext().getAuthentication();
        if (xacThuc != null && xacThuc.getPrincipal() instanceof NguoiDungChinhThuc p) {
            maNd = p.getMaNguoiDung();
            tenDn = p.getUsername();
        }
        LichSuTrangThaiLichHen dong = LichSuTrangThaiLichHen.builder()
                .lichHen(lichHen)
                .trangThaiCu(cu)
                .trangThaiMoi(moi)
                .maNguoiDung(maNd)
                .tenDangNhap(tenDn)
                .build();
        lichSuTrangThaiLichHenRepository.save(dong);
    }

    @Transactional
    public LichHenDto capNhat(Long ma, LichHenDto dto) {
        LichHen lh = lichHenRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + ma));
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(lh.getBenhNhan().getId());
        if (!quyenTruyCapHoSoBenhNhan.laNhanVien()) {
            if (!dto.getMaBenhNhan().equals(lh.getBenhNhan().getId())) {
                throw new AccessDeniedException("Không được đổi bệnh nhân của lịch.");
            }
        }
        if (coTrung(dto.getMaBacSi(), dto.getNgayHen(), dto.getGioHen(), ma)) {
            throw new RuntimeException("Trùng lịch khám.");
        }
        lh.setBenhNhan(benhNhanRepository.findById(dto.getMaBenhNhan()).orElseThrow());
        lh.setBacSi(bacSiRepository.findById(dto.getMaBacSi()).orElseThrow());
        lh.setDichVu(dichVuRepository.findById(dto.getMaDichVu()).orElseThrow());
        lh.setNgayHen(dto.getNgayHen());
        lh.setGioHen(dto.getGioHen());
        lh.setGhiChu(dto.getGhiChu());
        return sangDto(lichHenRepository.save(lh));
    }

    private boolean coTrung(Long maBacSi, LocalDate ngay, java.time.LocalTime gio, Long boQuaMaLich) {
        var ds = lichHenRepository.findTrungLich(maBacSi, ngay, gio);
        return ds.stream().anyMatch(a -> !a.getId().equals(boQuaMaLich));
    }

    private LichHenDto sangDto(LichHen lh) {
        LichHenDto dto = new LichHenDto();
        dto.setId(lh.getId());
        dto.setMaBenhNhan(lh.getBenhNhan().getId());
        dto.setTenBenhNhan(lh.getBenhNhan().getHoTen());
        dto.setMaBacSi(lh.getBacSi().getId());
        dto.setTenBacSi(lh.getBacSi().getNguoiDung() != null ? lh.getBacSi().getNguoiDung().getHoTen() : null);
        dto.setMaDichVu(lh.getDichVu().getId());
        dto.setTenDichVu(lh.getDichVu().getTen());
        dto.setNgayHen(lh.getNgayHen());
        dto.setGioHen(lh.getGioHen());
        dto.setTrangThai(lh.getTrangThai());
        dto.setGhiChu(lh.getGhiChu());
        return dto;
    }
}
