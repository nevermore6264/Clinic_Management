package com.clinic.repository;

import com.clinic.entity.NhatKyNhacLich;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NhatKyNhacLichRepository extends JpaRepository<NhatKyNhacLich, Long> {
    Optional<NhatKyNhacLich> findByLichHenIdAndKenh(Long maLichHen, NhatKyNhacLich.KenhNhac kenh);
}
