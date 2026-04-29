package com.clinic.repository;

import com.clinic.entity.NhatKyHeThong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface NhatKyHeThongRepository extends JpaRepository<NhatKyHeThong, Long> {
    Page<NhatKyHeThong> findByLoaiThucTheAndMaThucThe(String loaiThucThe, Long maThucThe, Pageable phanTrang);
    Page<NhatKyHeThong> findByMaNguoiDungOrderByTaoLucDesc(Long maNguoiDung, Pageable phanTrang);
    Page<NhatKyHeThong> findByTaoLucBetweenOrderByTaoLucDesc(Instant tuLuc, Instant denLuc, Pageable phanTrang);
}
