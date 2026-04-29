package com.clinic.service;

import com.clinic.dto.BaoCaoDoanhThuDto;
import com.clinic.dto.ThongKeBangDieuKhienDto;
import com.clinic.repository.BenhNhanRepository;
import com.clinic.repository.GiaoDichThanhToanRepository;
import com.clinic.repository.LichHenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BangDieuKhienService {

    private final BenhNhanRepository benhNhanRepository;
    private final LichHenRepository lichHenRepository;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final BaoCaoService baoCaoService;

    @Transactional(readOnly = true)
    public ThongKeBangDieuKhienDto layThongKe() {
        LocalDate homNay = LocalDate.now();
        LocalDate dauTuan = homNay.minusDays(homNay.getDayOfWeek().getValue() - 1);
        LocalDate cuoiTuan = dauTuan.plusDays(6);

        long tongBenhNhan = benhNhanRepository.count();
        long lichHomNay = lichHenRepository.findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(
                homNay, homNay, PageRequest.of(0, 1000)).getContent().size();
        long lichTuanNay = lichHenRepository.findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(
                dauTuan, cuoiTuan, PageRequest.of(0, 5000)).getContent().size();

        Instant bdHomNay = homNay.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant ktHomNay = homNay.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant bdTuan = dauTuan.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant ktTuan = cuoiTuan.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        BigDecimal doanhThuHomNay = giaoDichThanhToanRepository.findByLucThanhToanBetween(bdHomNay, ktHomNay).stream()
                .map(g -> g.getSoTien()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal doanhThuTuan = giaoDichThanhToanRepository.findByLucThanhToanBetween(bdTuan, ktTuan).stream()
                .map(g -> g.getSoTien()).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BaoCaoDoanhThuDto> bayNgay = baoCaoService.doanhThuTheoNgay(homNay.minusDays(6), homNay);

        ThongKeBangDieuKhienDto dto = new ThongKeBangDieuKhienDto();
        dto.setTongBenhNhan(tongBenhNhan);
        dto.setLichHenHomNay(lichHomNay);
        dto.setLichHenTuanNay(lichTuanNay);
        dto.setDoanhThuHomNay(doanhThuHomNay);
        dto.setDoanhThuTuanNay(doanhThuTuan);
        dto.setDoanhThu7NgayGanNhat(bayNgay);
        return dto;
    }
}
