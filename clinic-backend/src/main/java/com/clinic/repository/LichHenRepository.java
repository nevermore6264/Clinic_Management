package com.clinic.repository;

import com.clinic.entity.LichHen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Collection;

public interface LichHenRepository extends JpaRepository<LichHen, Long> {
    List<LichHen> findByBenhNhanIdOrderByNgayHenDescGioHenDesc(Long maBenhNhan, Pageable pageable);
    List<LichHen> findByBacSiIdAndNgayHenOrderByGioHen(Long maBacSi, LocalDate ngay);
    Page<LichHen> findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(LocalDate tuNgay, LocalDate denNgay, Pageable pageable);

    @Query("SELECT a FROM LichHen a WHERE a.bacSi.id = :maBacSi AND a.ngayHen = :ngay AND a.gioHen = :gio AND a.trangThai NOT IN ('HUY', 'VANG')")
    List<LichHen> findTrungLich(Long maBacSi, LocalDate ngay, LocalTime gio);

    List<LichHen> findByBacSiIdAndNgayHenAndTrangThaiNotIn(Long maBacSi, LocalDate ngay, Collection<LichHen.TrangThaiLichHen> trangThai);

    long countByNgayHenAndTrangThai(LocalDate ngayHen, LichHen.TrangThaiLichHen trangThai);

    long countByNgayHenAndTrangThaiIn(LocalDate ngayHen, Collection<LichHen.TrangThaiLichHen> trangThai);

    @Query("select count(distinct l.bacSi.id) from LichHen l where l.ngayHen = :ngay and l.trangThai not in ('HUY', 'VANG')")
    long demSoBacSiCoLichTrongNgay(@Param("ngay") LocalDate ngay);
}
