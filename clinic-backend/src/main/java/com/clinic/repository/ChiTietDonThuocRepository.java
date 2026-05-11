package com.clinic.repository;

import com.clinic.entity.ChiTietDonThuoc;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChiTietDonThuocRepository extends JpaRepository<ChiTietDonThuoc, Long> {

    @Query("SELECT ct FROM ChiTietDonThuoc ct "
            + "JOIN FETCH ct.hoSoKham hs JOIN FETCH hs.lichHen lh JOIN FETCH lh.benhNhan bn JOIN FETCH ct.thuoc t "
            + "ORDER BY ct.id DESC")
    List<ChiTietDonThuoc> bangKeGanNhat(Pageable phanTrang);
}
