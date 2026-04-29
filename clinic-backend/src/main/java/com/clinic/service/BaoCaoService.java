package com.clinic.service;

import com.clinic.dto.BaoCaoDoanhThuDto;
import com.clinic.entity.GiaoDichThanhToan;
import com.clinic.repository.GiaoDichThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BaoCaoService {

    private final GiaoDichThanhToanRepository khoGiaoDich;

    @Transactional(readOnly = true)
    public List<BaoCaoDoanhThuDto> doanhThuTheoNgay(LocalDate tuNgay, LocalDate denNgay) {
        return doanhThuTheoNgay(tuNgay, denNgay, null, null);
    }

    @Transactional(readOnly = true)
    public List<BaoCaoDoanhThuDto> doanhThuTheoNgay(LocalDate tuNgay, LocalDate denNgay, Long maBacSi, Long maDichVu) {
        Instant batDau = tuNgay.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant ketThuc = denNgay.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<GiaoDichThanhToan> ds = khoGiaoDich.findByLucThanhToanBetween(batDau, ketThuc);
        if (maBacSi != null) {
            ds = ds.stream()
                    .filter(g -> g.getHoaDon().getLichHen() != null
                            && g.getHoaDon().getLichHen().getBacSi().getId().equals(maBacSi))
                    .collect(Collectors.toList());
        }
        if (maDichVu != null) {
            ds = ds.stream()
                    .filter(g -> g.getHoaDon().getChiTiet().stream()
                            .anyMatch(ct -> ct.getDichVu().getId().equals(maDichVu)))
                    .collect(Collectors.toList());
        }
        Map<LocalDate, List<GiaoDichThanhToan>> theoNgay = ds.stream()
                .collect(Collectors.groupingBy(g -> LocalDate.ofInstant(g.getLucThanhToan(), ZoneId.systemDefault())));
        List<BaoCaoDoanhThuDto> ketQua = new ArrayList<>();
        theoNgay.forEach((ngay, danhSach) -> {
            BigDecimal tong = danhSach.stream().map(GiaoDichThanhToan::getSoTien).reduce(BigDecimal.ZERO, BigDecimal::add);
            BaoCaoDoanhThuDto dto = new BaoCaoDoanhThuDto();
            dto.setNgay(ngay);
            dto.setTongDoanhThu(tong);
            dto.setSoLichHen((long) danhSach.size());
            ketQua.add(dto);
        });
        ketQua.sort((a, b) -> a.getNgay().compareTo(b.getNgay()));
        return ketQua;
    }
}
