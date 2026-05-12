package com.clinic.repository;

import com.clinic.entity.PayOsDonHang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayOsDonHangRepository extends JpaRepository<PayOsDonHang, Long> {
    Optional<PayOsDonHang> findByOrderCode(int orderCode);

    boolean existsByOrderCode(int orderCode);
}
