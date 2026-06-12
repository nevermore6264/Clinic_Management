package com.clinic.repository;

import com.clinic.entity.MaKhoiPhucMatKhau;
import com.clinic.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MaKhoiPhucMatKhauRepository extends JpaRepository<MaKhoiPhucMatKhau, Long> {

    Optional<MaKhoiPhucMatKhau> findByToken(String token);

    @Modifying
    @Query("update MaKhoiPhucMatKhau m set m.daSuDung = true where m.nguoiDung = :nguoiDung and m.daSuDung = false")
    void vohieuHoaTatCa(@Param("nguoiDung") NguoiDung nguoiDung);
}
