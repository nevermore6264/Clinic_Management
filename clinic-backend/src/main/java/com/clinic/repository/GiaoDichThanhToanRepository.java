package com.clinic.repository;

import com.clinic.entity.GiaoDichThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface GiaoDichThanhToanRepository extends JpaRepository<GiaoDichThanhToan, Long> {
    // HoaDon không còn liên kết trực tiếp BenhNhan; điều hướng qua lichHen
    List<GiaoDichThanhToan> findByHoaDon_LichHen_BenhNhan_IdOrderByLucThanhToanDesc(Long maBenhNhan);
    List<GiaoDichThanhToan> findByLucThanhToanBetween(Instant tuLuc, Instant denLuc);
}
