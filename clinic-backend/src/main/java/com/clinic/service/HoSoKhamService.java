package com.clinic.service;

import com.clinic.dto.ChiTietDichVuKhamDto;
import com.clinic.dto.ChiTietDonThuocDto;
import com.clinic.dto.HoSoKhamDto;
import com.clinic.entity.ChiTietDichVuKham;
import com.clinic.entity.ChiTietDonThuoc;
import com.clinic.entity.DichVu;
import com.clinic.entity.DonThuoc;
import com.clinic.entity.HoSoKham;
import com.clinic.entity.LichHen;
import com.clinic.entity.Thuoc;
import com.clinic.repository.DichVuRepository;
import com.clinic.repository.HoSoKhamRepository;
import com.clinic.repository.LichHenRepository;
import com.clinic.repository.ThuocRepository;
import com.clinic.security.QuyenTruyCapHoSoBenhNhan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoSoKhamService {

    private final HoSoKhamRepository hoSoKhamRepository;
    private final LichHenRepository lichHenRepository;
    private final ThuocRepository thuocRepository;
    private final DichVuRepository dichVuRepository;
    private final QuyenTruyCapHoSoBenhNhan quyenTruyCapHoSoBenhNhan;

    @Transactional(readOnly = true)
    public List<HoSoKhamDto> timTheoBenhNhan(Long maBenhNhan) {
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(maBenhNhan);
        return hoSoKhamRepository.findByBenhNhanWithChiTiet(maBenhNhan).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HoSoKhamDto layTheoMaLichHen(Long maLichHen) {
        LichHen lh = lichHenRepository.findById(maLichHen).orElse(null);
        if (lh == null) return null;
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(lh.getBenhNhan().getId());
        return hoSoKhamRepository.findByLichHenIdWithChiTiet(maLichHen)
                .map(this::sangDto)
                .orElse(null);
    }

    @Transactional
    public HoSoKhamDto luu(Long maLichHen, HoSoKhamDto dto) {
        LichHen lh = lichHenRepository.findById(maLichHen).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        HoSoKham hs = hoSoKhamRepository.findByLichHenIdWithChiTiet(maLichHen).orElse(new HoSoKham());
        hs.setLichHen(lh);
        hs.setChanDoan(dto.getChanDoan());
        hs.setGhiChu(dto.getGhiChu());
        hs.setNhietDo(dto.getNhietDo());
        hs.setHuyetApTamThu(dto.getHuyetApTamThu());
        hs.setHuyetApTamTruong(dto.getHuyetApTamTruong());
        hs.setNhipTim(dto.getNhipTim());
        hs.setNhipTho(dto.getNhipTho());
        hs.setChieuCaoCm(dto.getChieuCaoCm());
        hs.setCanNangKg(dto.getCanNangKg());
        hs.setSpo2(dto.getSpo2());
        hs.setGhiChuSinhHieu(dto.getGhiChuSinhHieu());

        String noiDungTuDo = dto.getDonThuoc() != null ? dto.getDonThuoc() : "";
        List<ChiTietDonThuocDto> dong = dto.getChiTietDonThuoc();
        if (dong == null) dong = Collections.emptyList();
        boolean coDongThuoc = dong.stream().anyMatch(ct -> ct.getMaThuoc() != null);
        boolean coNoiDungTuDo = !noiDungTuDo.isBlank();

        if (!coDongThuoc && !coNoiDungTuDo) {
            hs.setDonThuoc(null);
        } else {
            DonThuoc dt = hs.getDonThuoc();
            if (dt == null) {
                dt = DonThuoc.builder().hoSoKham(hs).noiDung(noiDungTuDo).build();
                hs.setDonThuoc(dt);
            } else {
                dt.setNoiDung(noiDungTuDo);
                dt.getChiTietDonThuoc().clear();
            }
            for (ChiTietDonThuocDto ctDto : dong) {
                if (ctDto.getMaThuoc() == null) continue;
                Thuoc thuoc = thuocRepository.findById(ctDto.getMaThuoc())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + ctDto.getMaThuoc()));
                int sl = ctDto.getSoLuong() != null && ctDto.getSoLuong() > 0 ? ctDto.getSoLuong() : 1;
                BigDecimal dg = ctDto.getDonGia() != null ? ctDto.getDonGia() : thuoc.getGiaBan();
                ChiTietDonThuoc ct = ChiTietDonThuoc.builder()
                        .donThuoc(dt)
                        .thuoc(thuoc)
                        .soLuong(sl)
                        .donGia(dg)
                        .lieuDung(ctDto.getLieuDung())
                        .build();
                dt.getChiTietDonThuoc().add(ct);
            }
        }

        List<ChiTietDichVuKhamDto> dongDv = dto.getChiTietDichVu();
        if (dongDv == null) {
            dongDv = Collections.emptyList();
        }
        hs.getChiTietDichVuKham().clear();
        for (ChiTietDichVuKhamDto dvDto : dongDv) {
            if (dvDto.getMaDichVu() == null) {
                continue;
            }
            DichVu dichVu = dichVuRepository.findById(dvDto.getMaDichVu())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ: " + dvDto.getMaDichVu()));
            int sl = dvDto.getSoLuong() != null && dvDto.getSoLuong() > 0 ? dvDto.getSoLuong() : 1;
            BigDecimal dg = dvDto.getDonGia() != null ? dvDto.getDonGia() : dichVu.getGia();
            ChiTietDichVuKham ctDv = ChiTietDichVuKham.builder()
                    .hoSoKham(hs)
                    .dichVu(dichVu)
                    .soLuong(sl)
                    .donGia(dg)
                    .build();
            hs.getChiTietDichVuKham().add(ctDv);
        }

        return sangDto(hoSoKhamRepository.save(hs));
    }

    private HoSoKhamDto sangDto(HoSoKham hs) {
        HoSoKhamDto dto = new HoSoKhamDto();
        dto.setId(hs.getId());
        dto.setMaLichHen(hs.getLichHen().getId());
        dto.setChanDoan(hs.getChanDoan());
        dto.setGhiChu(hs.getGhiChu());
        dto.setNhietDo(hs.getNhietDo());
        dto.setHuyetApTamThu(hs.getHuyetApTamThu());
        dto.setHuyetApTamTruong(hs.getHuyetApTamTruong());
        dto.setNhipTim(hs.getNhipTim());
        dto.setNhipTho(hs.getNhipTho());
        dto.setChieuCaoCm(hs.getChieuCaoCm());
        dto.setCanNangKg(hs.getCanNangKg());
        dto.setSpo2(hs.getSpo2());
        dto.setGhiChuSinhHieu(hs.getGhiChuSinhHieu());
        dto.setDonThuoc("");
        DonThuoc d = hs.getDonThuoc();
        if (d != null) {
            if (d.getNoiDung() != null) {
                dto.setDonThuoc(d.getNoiDung());
            }
            if (d.getChiTietDonThuoc() != null && !d.getChiTietDonThuoc().isEmpty()) {
                dto.setChiTietDonThuoc(d.getChiTietDonThuoc().stream().map(this::sangChiTiet).collect(Collectors.toList()));
            }
        }
        if (hs.getChiTietDichVuKham() != null && !hs.getChiTietDichVuKham().isEmpty()) {
            dto.setChiTietDichVu(hs.getChiTietDichVuKham().stream()
                    .map(this::sangChiTietDichVu)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ChiTietDichVuKhamDto sangChiTietDichVu(ChiTietDichVuKham ct) {
        ChiTietDichVuKhamDto d = new ChiTietDichVuKhamDto();
        d.setId(ct.getId());
        d.setMaDichVu(ct.getDichVu().getId());
        d.setTenDichVu(ct.getDichVu().getTen());
        d.setTenLoaiDichVu(
                ct.getDichVu().getLoaiDichVu() != null
                        ? ct.getDichVu().getLoaiDichVu().getTenLoaiDichVu()
                        : null);
        d.setSoLuong(ct.getSoLuong());
        d.setDonGia(ct.getDonGia());
        return d;
    }

    private ChiTietDonThuocDto sangChiTiet(ChiTietDonThuoc ct) {
        ChiTietDonThuocDto d = new ChiTietDonThuocDto();
        d.setId(ct.getId());
        d.setMaThuoc(ct.getThuoc().getId());
        d.setTenThuoc(ct.getThuoc().getTenThuoc());
        d.setSoLuong(ct.getSoLuong());
        d.setDonGia(ct.getDonGia());
        d.setLieuDung(ct.getLieuDung());
        return d;
    }
}
