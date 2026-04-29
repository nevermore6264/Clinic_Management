package com.clinic.repository;

import com.clinic.entity.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    List<HoaDon> findByLichHenBenhNhanIdOrderByTaoLucDesc(Long maBenhNhan);
    Page<HoaDon> findByTaoLucBetweenOrderByTaoLucDesc(Instant tuLuc, Instant denLuc, Pageable pageable);
}
