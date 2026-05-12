package com.clinic.repository;

import com.clinic.entity.Thuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ThuocRepository extends JpaRepository<Thuoc, Long>, JpaSpecificationExecutor<Thuoc> {
    List<Thuoc> findByHoatDongTrue();
}
