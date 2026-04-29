package com.clinic.repository;

import com.clinic.entity.LichHen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface LichHenRepository extends JpaRepository<LichHen, Long> {
    List<LichHen> findByBenhNhanIdOrderByNgayHenDescGioHenDesc(Long maBenhNhan, Pageable pageable);
    List<LichHen> findByBacSiIdAndNgayHenOrderByGioHen(Long maBacSi, LocalDate ngay);
    Page<LichHen> findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(LocalDate tuNgay, LocalDate denNgay, Pageable pageable);

    @Query("SELECT a FROM LichHen a WHERE a.bacSi.id = :maBacSi AND a.ngayHen = :ngay AND a.gioHen = :gio AND a.trangThai NOT IN ('HUY', 'VANG')")
    List<LichHen> findTrungLich(Long maBacSi, LocalDate ngay, LocalTime gio);
}
