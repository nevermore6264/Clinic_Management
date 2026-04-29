package com.clinic.service;

import com.clinic.dto.LichLamViecBacSiDto;
import com.clinic.entity.BacSi;
import com.clinic.entity.LichLamViecBacSi;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.LichLamViecBacSiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichLamViecBacSiService {

    private final LichLamViecBacSiRepository khoLichLamViec;
    private final BacSiRepository khoBacSi;

    @Transactional(readOnly = true)
    public List<LichLamViecBacSiDto> timTheoBacSiVaNgay(Long maBacSi, LocalDate ngay) {
        return khoLichLamViec.findByBacSiIdAndNgayLich(maBacSi, ngay).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LichLamViecBacSiDto> timTheoBacSiVaKhoangNgay(Long maBacSi, LocalDate tuNgay, LocalDate denNgay) {
        return khoLichLamViec.findByBacSiIdAndNgayLichBetween(maBacSi, tuNgay, denNgay).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional
    public LichLamViecBacSiDto tao(LichLamViecBacSiDto dto) {
        BacSi bs = khoBacSi.findById(dto.getMaBacSi()).orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        LichLamViecBacSi s = new LichLamViecBacSi();
        s.setBacSi(bs);
        s.setNgayLich(dto.getNgayLich());
        s.setKhungGioBatDau(dto.getKhungGioBatDau());
        s.setKhungGioKetThuc(dto.getKhungGioKetThuc());
        return sangDto(khoLichLamViec.save(s));
    }

    @Transactional
    public LichLamViecBacSiDto capNhat(Long id, LichLamViecBacSiDto dto) {
        LichLamViecBacSi s = khoLichLamViec.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch làm việc"));
        s.setNgayLich(dto.getNgayLich());
        s.setKhungGioBatDau(dto.getKhungGioBatDau());
        s.setKhungGioKetThuc(dto.getKhungGioKetThuc());
        return sangDto(khoLichLamViec.save(s));
    }

    @Transactional
    public void xoa(Long id) {
        khoLichLamViec.deleteById(id);
    }

    private LichLamViecBacSiDto sangDto(LichLamViecBacSi s) {
        LichLamViecBacSiDto dto = new LichLamViecBacSiDto();
        dto.setId(s.getId());
        dto.setMaBacSi(s.getBacSi().getId());
        dto.setTenBacSi(s.getBacSi().getNguoiDung() != null ? s.getBacSi().getNguoiDung().getHoTen() : null);
        dto.setNgayLich(s.getNgayLich());
        dto.setKhungGioBatDau(s.getKhungGioBatDau());
        dto.setKhungGioKetThuc(s.getKhungGioKetThuc());
        return dto;
    }
}
