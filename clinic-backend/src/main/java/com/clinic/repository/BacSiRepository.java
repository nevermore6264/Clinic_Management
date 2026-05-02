package com.clinic.repository;

import com.clinic.entity.BacSi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BacSiRepository extends JpaRepository<BacSi, Long> {
    List<BacSi> findByHoatDongTrue();

    Optional<BacSi> findByNguoiDung_Id(Long maNguoiDung);

    long countByChuyenKhoa_Id(Long maChuyenKhoa);
}
