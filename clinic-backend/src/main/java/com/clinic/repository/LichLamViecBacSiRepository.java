package com.clinic.repository;

import com.clinic.entity.LichLamViecBacSi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LichLamViecBacSiRepository extends JpaRepository<LichLamViecBacSi, Long> {
    List<LichLamViecBacSi> findByBacSiIdAndNgayLich(Long maBacSi, LocalDate ngay);
    List<LichLamViecBacSi> findByBacSiIdAndNgayLichBetween(Long maBacSi, LocalDate tuNgay, LocalDate denNgay);
}
