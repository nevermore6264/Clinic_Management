package com.clinic.repository;

import com.clinic.entity.HoSoKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HoSoKhamRepository extends JpaRepository<HoSoKham, Long> {

    @Query("SELECT DISTINCT h FROM HoSoKham h "
            + "LEFT JOIN FETCH h.chiTietDonThuoc ct "
            + "LEFT JOIN FETCH ct.thuoc "
            + "WHERE h.lichHen.id = :maLichHen")
    Optional<HoSoKham> findByLichHenIdWithChiTiet(@Param("maLichHen") Long maLichHen);

    @Query("SELECT DISTINCT h FROM HoSoKham h "
            + "LEFT JOIN FETCH h.chiTietDonThuoc ct "
            + "LEFT JOIN FETCH ct.thuoc "
            + "WHERE h.lichHen.benhNhan.id = :maBenhNhan ORDER BY h.taoLuc DESC")
    List<HoSoKham> findByBenhNhanWithChiTiet(@Param("maBenhNhan") Long maBenhNhan);
}
