package com.clinic.repository;

import com.clinic.entity.ChuyenKhoa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChuyenKhoaRepository extends JpaRepository<ChuyenKhoa, Long> {
    Optional<ChuyenKhoa> findByTenChuyenKhoa(String tenChuyenKhoa);
}
