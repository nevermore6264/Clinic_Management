package com.clinic.repository;

import com.clinic.entity.LichSuTrangThaiLichHen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LichSuTrangThaiLichHenRepository extends JpaRepository<LichSuTrangThaiLichHen, Long> {

    @Query("SELECT l FROM LichSuTrangThaiLichHen l WHERE l.lichHen.id = :maLichHen ORDER BY l.taoLuc ASC")
    List<LichSuTrangThaiLichHen> findByMaLichHenOrderByTaoLuc(@Param("maLichHen") Long maLichHen);
}
