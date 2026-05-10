package com.clinic.repository;

import com.clinic.entity.LichNgoaiLe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LichNgoaiLeRepository extends JpaRepository<LichNgoaiLe, Long> {
    List<LichNgoaiLe> findByBacSiIdAndNgayNgoaiLe(Long maBacSi, LocalDate ngayNgoaiLe);
}
