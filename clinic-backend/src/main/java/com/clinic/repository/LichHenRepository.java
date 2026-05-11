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

    @Query("SELECT COUNT(a) FROM LichHen a WHERE a.benhNhan.id = :maBenhNhan AND a.ngayHen = :ngay AND a.gioHen = :gio "
            + "AND a.trangThai NOT IN ('HUY', 'VANG') AND (:boQuaMa IS NULL OR a.id <> :boQuaMa)")
    long demBenhNhanTrungGio(
            @Param("maBenhNhan") Long maBenhNhan,
            @Param("ngay") LocalDate ngay,
            @Param("gio") LocalTime gio,
            @Param("boQuaMa") Long boQuaMaLich);

    List<LichHen> findByBacSiIdAndNgayHenAndTrangThaiNotIn(Long maBacSi, LocalDate ngay, Collection<LichHen.TrangThaiLichHen> trangThai);

    long countByNgayHenAndTrangThai(LocalDate ngayHen, LichHen.TrangThaiLichHen trangThai);

    long countByNgayHenAndTrangThaiIn(LocalDate ngayHen, Collection<LichHen.TrangThaiLichHen> trangThai);

    @Query("select count(distinct l.bacSi.id) from LichHen l where l.ngayHen = :ngay and l.trangThai not in ('HUY', 'VANG')")
    long demSoBacSiCoLichTrongNgay(@Param("ngay") LocalDate ngay);
}
