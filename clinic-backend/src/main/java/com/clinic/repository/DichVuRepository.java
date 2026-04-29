package com.clinic.repository;

import com.clinic.entity.DichVu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DichVuRepository extends JpaRepository<DichVu, Long> {
    List<DichVu> findByHoatDongTrue();
    long countByLoaiDichVuId(Long maLoaiDichVu);
}
