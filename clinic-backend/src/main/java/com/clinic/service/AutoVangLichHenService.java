package com.clinic.service;

import com.clinic.entity.LichHen;
import com.clinic.entity.LichSuTrangThaiLichHen;
import com.clinic.repository.LichHenRepository;
import com.clinic.repository.LichSuTrangThaiLichHenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoVangLichHenService {

    private final LichHenRepository lichHenRepository;
    private final LichSuTrangThaiLichHenRepository lichSuTrangThaiLichHenRepository;

    /**
     * Tự động chuyển lịch quá giờ tới trạng thái VANG nếu bệnh nhân chưa được đưa vào luồng khám.
     * Chạy mỗi ngày lúc 12:00 theo giờ hệ thống.
     */
    @Scheduled(cron = "0 0 12 * * *")
    @Transactional
    public void chuyenTrangThaiQuaHanSangVang() {
        LocalDate homNay = LocalDate.now();
        LocalTime cutoff = LocalTime.of(12, 0);

        // Chỉ chuyển những lịch còn "chờ" (chưa bắt đầu khám).
        EnumSet<LichHen.TrangThaiLichHen> trangThaiCho = EnumSet.of(
                LichHen.TrangThaiLichHen.DA_DAT,
                LichHen.TrangThaiLichHen.DA_TIEP_NHAN
        );

        List<LichHen> canChuyen = lichHenRepository
                .findByNgayHenAndGioHenLessThanEqualAndTrangThaiIn(homNay, cutoff, trangThaiCho);

        if (canChuyen.isEmpty()) return;

        for (LichHen lh : canChuyen) {
            LichHen.TrangThaiLichHen cu = lh.getTrangThai();
            if (cu == LichHen.TrangThaiLichHen.VANG || cu == LichHen.TrangThaiLichHen.HUY) {
                continue;
            }

            lh.setTrangThai(LichHen.TrangThaiLichHen.VANG);
            lichHenRepository.save(lh);

            lichSuTrangThaiLichHenRepository.save(
                    LichSuTrangThaiLichHen.builder()
                            .lichHen(lh)
                            .trangThaiCu(cu)
                            .trangThaiMoi(LichHen.TrangThaiLichHen.VANG)
                            .ghiChu("Tự động: quá giờ 12:00 mà chưa đi khám.")
                            .build()
            );
        }

        log.info("AutoVangLichHenService: đã chuyển {} lịch sang VANG lúc 12:00.", canChuyen.size());
    }
}

