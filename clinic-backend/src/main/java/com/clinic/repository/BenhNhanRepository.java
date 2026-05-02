package com.clinic.repository;

import com.clinic.entity.BenhNhan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BenhNhanRepository extends JpaRepository<BenhNhan, Long> {
    Page<BenhNhan> findByHoatDongTrue(Pageable pageable);
    List<BenhNhan> findByHoatDongTrue();
    List<BenhNhan> findByHoTenContainingIgnoreCaseAndHoatDongTrue(String ten);

    @Query("""
            SELECT b FROM BenhNhan b WHERE
            (:ten IS NULL OR :ten = '' OR LOWER(b.hoTen) LIKE LOWER(CONCAT('%', :ten, '%'))) AND
            (:hoatDong IS NULL OR b.hoatDong = :hoatDong) AND
            (:gioiTinh IS NULL OR :gioiTinh = '' OR b.gioiTinh = :gioiTinh) AND
            (:nhomMau IS NULL OR :nhomMau = '' OR b.nhomMau = :nhomMau)
            """)
    Page<BenhNhan> timLoc(
            @Param("ten") String ten,
            @Param("hoatDong") Boolean hoatDong,
            @Param("gioiTinh") String gioiTinh,
            @Param("nhomMau") String nhomMau,
            Pageable pageable);
}
