package com.clinic.repository;

import com.clinic.entity.PhieuChi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PhieuChiRepository extends JpaRepository<PhieuChi, Long> {
    Page<PhieuChi> findByNgayChiBetweenOrderByNgayChiDesc(LocalDate tu, LocalDate den, Pageable phanTrang);

    @Query("SELECT COALESCE(SUM(p.soTien), 0) FROM PhieuChi p WHERE p.ngayChi BETWEEN :tu AND :den")
    BigDecimal tongTienTrongKhoang(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT COUNT(p) FROM PhieuChi p WHERE p.ngayChi BETWEEN :tu AND :den")
    long demTrongKhoang(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT p.loai, COALESCE(SUM(p.soTien), 0) FROM PhieuChi p WHERE p.ngayChi BETWEEN :tu AND :den GROUP BY p.loai")
    List<Object[]> tongTienTheoLoaiTrongKhoang(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT COALESCE(SUM(p.soTien), 0) FROM PhieuChi p")
    BigDecimal tongTienToanBo();

    @Query("SELECT COUNT(p) FROM PhieuChi p")
    long demToanBo();

    @Query("SELECT p.loai, COALESCE(SUM(p.soTien), 0) FROM PhieuChi p GROUP BY p.loai")
    List<Object[]> tongTienTheoLoaiToanBo();
}
