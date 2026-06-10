package com.clinic.repository;

import com.clinic.entity.HoSoKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HoSoKhamRepository extends JpaRepository<HoSoKham, Long> {

    @Query("SELECT h FROM HoSoKham h WHERE h.lichHen.id = :maLichHen")
    Optional<HoSoKham> findByLichHenId(@Param("maLichHen") Long maLichHen);

    @Query("SELECT DISTINCT h FROM HoSoKham h "
            + "LEFT JOIN FETCH h.donThuoc d "
            + "LEFT JOIN FETCH d.chiTietDonThuoc ct "
            + "LEFT JOIN FETCH ct.thuoc "
            + "WHERE h.id = :id")
    Optional<HoSoKham> fetchDonThuocChiTiet(@Param("id") Long id);

    @Query("SELECT DISTINCT h FROM HoSoKham h "
            + "LEFT JOIN FETCH h.chiTietDichVuKham dv "
            + "LEFT JOIN FETCH dv.dichVu dichVu "
            + "LEFT JOIN FETCH dichVu.loaiDichVu "
            + "WHERE h.id = :id")
    Optional<HoSoKham> fetchChiTietDichVu(@Param("id") Long id);

    @Query("SELECT h FROM HoSoKham h WHERE h.lichHen.benhNhan.id = :maBenhNhan ORDER BY h.taoLuc DESC")
    List<HoSoKham> findByBenhNhanIdOrderByTaoLucDesc(@Param("maBenhNhan") Long maBenhNhan);
}
