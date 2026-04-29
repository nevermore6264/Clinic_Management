package com.clinic.repository;

import com.clinic.entity.PhieuChi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface PhieuChiRepository extends JpaRepository<PhieuChi, Long> {
    Page<PhieuChi> findByNgayChiBetweenOrderByNgayChiDesc(LocalDate tu, LocalDate den, Pageable phanTrang);
}
