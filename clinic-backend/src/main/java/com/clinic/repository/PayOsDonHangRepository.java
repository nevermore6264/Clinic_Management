package com.clinic.repository;

import com.clinic.entity.PayOsDonHang;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PayOsDonHangRepository extends JpaRepository<PayOsDonHang, Long> {
    Optional<PayOsDonHang> findByOrderCode(int orderCode);

    boolean existsByOrderCode(int orderCode);

    Optional<PayOsDonHang> findTopByMaHoaDonOrderByIdDesc(Long maHoaDon);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM PayOsDonHang d WHERE d.id = :id")
    Optional<PayOsDonHang> findByIdForUpdate(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE PayOsDonHang d SET d.daXuLyWebhook = true WHERE d.maHoaDon = :maHoaDon AND d.daXuLyWebhook = false")
    int danhDauDaXuLyTatCaDonChoHoaDon(@Param("maHoaDon") Long maHoaDon);
}
