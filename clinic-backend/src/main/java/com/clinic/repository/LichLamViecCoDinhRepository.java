package com.clinic.repository;

import com.clinic.entity.LichLamViecCoDinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

public interface LichLamViecCoDinhRepository extends JpaRepository<LichLamViecCoDinh, Long> {
    List<LichLamViecCoDinh> findByBacSiIdAndThuTrongTuanIn(Long maBacSi, Collection<Integer> thuTrongTuan);

    List<LichLamViecCoDinh> findByBacSiIdOrderByThuTrongTuanAscKhungGioBatDauAsc(Long maBacSi);

    long countByBacSiId(Long maBacSi);

    @Transactional
    long deleteByBacSiId(Long maBacSi);
}
