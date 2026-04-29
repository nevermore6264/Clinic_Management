package com.clinic.repository;

import com.clinic.entity.BenhNhan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BenhNhanRepository extends JpaRepository<BenhNhan, Long> {
    Page<BenhNhan> findByHoatDongTrue(Pageable pageable);
    List<BenhNhan> findByHoatDongTrue();
    List<BenhNhan> findByHoTenContainingIgnoreCaseAndHoatDongTrue(String ten);
}
