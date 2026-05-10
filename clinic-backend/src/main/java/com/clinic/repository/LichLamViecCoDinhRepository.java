package com.clinic.repository;

import com.clinic.entity.LichLamViecCoDinh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface LichLamViecCoDinhRepository extends JpaRepository<LichLamViecCoDinh, Long> {
    List<LichLamViecCoDinh> findByBacSiIdAndThuTrongTuanIn(Long maBacSi, Collection<Integer> thuTrongTuan);
}
