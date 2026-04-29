package com.clinic.repository;

import com.clinic.entity.Thuoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThuocRepository extends JpaRepository<Thuoc, Long> {
    List<Thuoc> findByHoatDongTrue();
}
