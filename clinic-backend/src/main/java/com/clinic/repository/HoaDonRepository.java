package com.clinic.repository;

import com.clinic.entity.HoaDon;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    List<HoaDon> findByLichHenBenhNhanIdOrderByTaoLucDesc(Long maBenhNhan);

    Page<HoaDon> findByTaoLucBetweenOrderByTaoLucDesc(Instant tuLuc, Instant denLuc, Pageable pageable);

    Optional<HoaDon> findByLichHen_Id(Long maLichHen);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM HoaDon h WHERE h.id = :id")
    Optional<HoaDon> findByIdForUpdate(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE HoaDon h SET h.payOsEmailXacNhanLuc = CURRENT_TIMESTAMP WHERE h.id = :id AND h.payOsEmailXacNhanLuc IS NULL")
    int claimPayOsEmailXacNhan(@Param("id") Long id);
}
