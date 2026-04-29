package com.clinic.repository;

import com.clinic.entity.BacSi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BacSiRepository extends JpaRepository<BacSi, Long> {
    List<BacSi> findByHoatDongTrue();
}
