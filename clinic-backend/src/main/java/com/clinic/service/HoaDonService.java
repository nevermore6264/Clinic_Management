package com.clinic.service;

import com.clinic.dto.*;
import com.clinic.entity.*;
import com.clinic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final LichHenRepository lichHenRepository;
    private final DichVuRepository dichVuRepository;
    private final LichHenService lichHenService;

    @Transactional(readOnly = true)
    public Page<HoaDonDto> timTrongKhoang(Instant tuLuc, Instant denLuc, Pageable phanTrang) {
        return hoaDonRepository.findByTaoLucBetweenOrderByTaoLucDesc(tuLuc, denLuc, phanTrang).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public List<HoaDonDto> timTheoBenhNhan(Long maBenhNhan) {
        return hoaDonRepository.findByLichHenBenhNhanIdOrderByTaoLucDesc(maBenhNhan)
                .stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HoaDonDto layTheoMa(Long ma) {
        return sangDto(hoaDonRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn: " + ma)));
    }

    @Transactional
    public HoaDonDto tao(Long maLichHen, List<ChiTietHoaDonDto> chiTiet) {
        LichHen lh = lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + maLichHen));
        if (lh.getTrangThai() == LichHen.TrangThaiLichHen.HUY
                || lh.getTrangThai() == LichHen.TrangThaiLichHen.VANG) {
            throw new RuntimeException("Không thể lập hóa đơn cho lịch đã hủy hoặc không đến.");
        }
        HoaDon hd = new HoaDon();
        hd.setLichHen(lh);
        hd.setBenhNhan(lh.getBenhNhan());
        hd.setTongTien(BigDecimal.ZERO);
        hd.setSoTienDaTra(BigDecimal.ZERO);
        hd.setTrangThai(HoaDon.TrangThaiHoaDon.CHO_THANH_TOAN);
        hd = hoaDonRepository.save(hd);

        BigDecimal tong = BigDecimal.ZERO;
        for (ChiTietHoaDonDto ct : chiTiet) {
            DichVu dv = dichVuRepository.findById(ct.getMaDichVu()).orElseThrow();
            int sl = ct.getSoLuong() != null ? ct.getSoLuong() : 1;
            BigDecimal thanhTien = dv.getGia().multiply(BigDecimal.valueOf(sl));
            tong = tong.add(thanhTien);
            ChiTietHoaDon dong = new ChiTietHoaDon();
            dong.setHoaDon(hd);
            dong.setDichVu(dv);
            dong.setDonGia(dv.getGia());
            dong.setSoLuong(sl);
            dong.setThanhTien(thanhTien);
            hd.getChiTiet().add(dong);
        }
        hd.setTongTien(tong);
        HoaDon daLuu = hoaDonRepository.save(hd);
        lichHenService.capNhatTrangThai(maLichHen, LichHen.TrangThaiLichHen.DA_THANH_TOAN);
        return sangDto(daLuu);
    }

    @Transactional
    public GiaoDichThanhToanDto themThanhToan(Long maHoaDon, GiaoDichThanhToanDto dto) {
        HoaDon hd = hoaDonRepository.findById(maHoaDon).orElseThrow();
        GiaoDichThanhToan gd = new GiaoDichThanhToan();
        gd.setHoaDon(hd);
        gd.setSoTien(dto.getSoTien());
        gd.setPhuongThuc(dto.getPhuongThuc() != null ? dto.getPhuongThuc() : GiaoDichThanhToan.PhuongThucThanhToan.TIEN_MAT);
        gd.setMaThamChieu(dto.getMaThamChieu());
        hd.getGiaoDichThanhToan().add(gd);
        BigDecimal daTraMoi = hd.getSoTienDaTra().add(dto.getSoTien());
        hd.setSoTienDaTra(daTraMoi);
        hd.setTrangThai(daTraMoi.compareTo(hd.getTongTien()) >= 0
                ? HoaDon.TrangThaiHoaDon.DA_THANH_TOAN
                : HoaDon.TrangThaiHoaDon.MOT_PHAN);
        hoaDonRepository.save(hd);
        if (hd.getTrangThai() == HoaDon.TrangThaiHoaDon.DA_THANH_TOAN && hd.getLichHen() != null) {
            lichHenService.capNhatTrangThai(
                    hd.getLichHen().getId(), LichHen.TrangThaiLichHen.DA_THANH_TOAN);
        }
        return sangGiaoDichDto(gd);
    }

    private HoaDonDto sangDto(HoaDon hd) {
        HoaDonDto dto = new HoaDonDto();
        dto.setId(hd.getId());
        dto.setMaLichHen(hd.getLichHen() != null ? hd.getLichHen().getId() : null);
        dto.setMaBenhNhan(hd.getBenhNhan() != null ? hd.getBenhNhan().getId()
                : (hd.getLichHen() != null && hd.getLichHen().getBenhNhan() != null
                        ? hd.getLichHen().getBenhNhan().getId() : null));
        dto.setTenBenhNhan(hd.getBenhNhan() != null ? hd.getBenhNhan().getHoTen()
                : (hd.getLichHen() != null && hd.getLichHen().getBenhNhan() != null
                        ? hd.getLichHen().getBenhNhan().getHoTen() : null));
        dto.setTongTien(hd.getTongTien());
        dto.setSoTienDaTra(hd.getSoTienDaTra());
        dto.setTrangThai(hd.getTrangThai());
        dto.setSoHoaDon(hd.getSoHoaDon());
        dto.setTaoLuc(hd.getTaoLuc());
        dto.setChiTiet(hd.getChiTiet().stream().map(this::sangChiTietDto).collect(Collectors.toList()));
        dto.setGiaoDichThanhToan(hd.getGiaoDichThanhToan().stream().map(this::sangGiaoDichDto).collect(Collectors.toList()));
        return dto;
    }

    private ChiTietHoaDonDto sangChiTietDto(ChiTietHoaDon ct) {
        ChiTietHoaDonDto dto = new ChiTietHoaDonDto();
        dto.setId(ct.getId());
        dto.setMaDichVu(ct.getDichVu().getId());
        dto.setTenDichVu(ct.getDichVu().getTen());
        dto.setDonGia(ct.getDonGia());
        dto.setSoLuong(ct.getSoLuong());
        dto.setThanhTien(ct.getThanhTien());
        return dto;
    }

    private GiaoDichThanhToanDto sangGiaoDichDto(GiaoDichThanhToan gd) {
        GiaoDichThanhToanDto dto = new GiaoDichThanhToanDto();
        dto.setId(gd.getId());
        dto.setSoTien(gd.getSoTien());
        dto.setPhuongThuc(gd.getPhuongThuc());
        dto.setMaThamChieu(gd.getMaThamChieu());
        dto.setLucThanhToan(gd.getLucThanhToan());
        return dto;
    }
}
