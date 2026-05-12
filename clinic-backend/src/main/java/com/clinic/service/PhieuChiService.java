package com.clinic.service;

import com.clinic.dto.PhieuChiDto;
import com.clinic.dto.PhieuChiTongHopDto;
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

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PhieuChiService {

    private final PhieuChiRepository phieuChiRepository;

    @Transactional(readOnly = true)
    public PhieuChiTongHopDto tongHop(LocalDate tuNgay, LocalDate denNgay) {
        BigDecimal tong;
        long dem;
        List<Object[]> rows;
        if (tuNgay != null && denNgay != null) {
            tong = phieuChiRepository.tongTienTrongKhoang(tuNgay, denNgay);
            dem = phieuChiRepository.demTrongKhoang(tuNgay, denNgay);
            rows = phieuChiRepository.tongTienTheoLoaiTrongKhoang(tuNgay, denNgay);
        } else {
            tong = phieuChiRepository.tongTienToanBo();
            dem = phieuChiRepository.demToanBo();
            rows = phieuChiRepository.tongTienTheoLoaiToanBo();
        }
        if (tong == null) {
            tong = BigDecimal.ZERO;
        }
        Map<String, BigDecimal> tienTheoLoai = new LinkedHashMap<>();
        for (Object[] row : rows) {
            if (row == null || row.length < 2 || row[0] == null) {
                continue;
            }
            PhieuChi.LoaiPhieuChi loai = (PhieuChi.LoaiPhieuChi) row[0];
            BigDecimal t = row[1] instanceof BigDecimal b ? b : BigDecimal.ZERO;
            tienTheoLoai.put(loai.name(), t);
        }
        return PhieuChiTongHopDto.builder()
                .soPhieu(dem)
                .tongTien(tong)
                .tienTheoLoai(tienTheoLoai)
                .build();
    }

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
                .chungTuThamChieu(trimRong(dto.getChungTuThamChieu()))
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
        pc.setChungTuThamChieu(trimRong(dto.getChungTuThamChieu()));
        return sangDto(phieuChiRepository.save(pc));
    }

    @Transactional
    public void xoa(Long id) {
        phieuChiRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public byte[] xuatCsvTheoThang(String thang) {
        YearMonth ym = YearMonth.parse(thang.trim());
        LocalDate tu = ym.atDay(1);
        LocalDate den = ym.atEndOfMonth();
        List<PhieuChi> all = phieuChiRepository.findByNgayChiBetweenOrderByNgayChiAscIdAsc(tu, den);
        DateTimeFormatter fmtLuc = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("ngay_chi,loai,mo_ta,so_tien,chung_tu_tham_chieu,ten_dang_nhap_nguoi_tao,tao_luc\n");
        for (PhieuChi p : all) {
            sb.append(csvEsc(p.getNgayChi() != null ? p.getNgayChi().toString() : "")).append(',');
            sb.append(csvEsc(p.getLoai() != null ? p.getLoai().name() : "")).append(',');
            sb.append(csvEsc(p.getMoTa())).append(',');
            sb.append(p.getSoTien() != null ? p.getSoTien().stripTrailingZeros().toPlainString() : "0").append(',');
            sb.append(csvEsc(p.getChungTuThamChieu())).append(',');
            sb.append(csvEsc(p.getTenDangNhapNguoiTao())).append(',');
            sb.append(csvEsc(p.getTaoLuc() != null ? fmtLuc.format(p.getTaoLuc().atZone(ZoneId.systemDefault()).toLocalDateTime()) : "")).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String trimRong(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String csvEsc(String s) {
        if (s == null) {
            return "";
        }
        String t = s.replace("\"", "\"\"");
        if (t.contains(",") || t.contains("\n") || t.contains("\"") || t.contains("\r")) {
            return "\"" + t + "\"";
        }
        return t;
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
        dto.setChungTuThamChieu(pc.getChungTuThamChieu());
        dto.setMaNguoiTao(pc.getMaNguoiTao());
        dto.setTenDangNhapNguoiTao(pc.getTenDangNhapNguoiTao());
        dto.setTaoLuc(pc.getTaoLuc());
        return dto;
    }
}
