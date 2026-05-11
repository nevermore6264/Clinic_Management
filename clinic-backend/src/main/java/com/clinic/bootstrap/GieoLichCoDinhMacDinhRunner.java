package com.clinic.bootstrap;

import com.clinic.service.LichLamViecBacSiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(50)
@RequiredArgsConstructor
public class GieoLichCoDinhMacDinhRunner implements ApplicationRunner {

    private final LichLamViecBacSiService lichLamViecBacSiService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int so = lichLamViecBacSiService.gieoMacDinhChoTatCaBacSi(false);
            if (so > 0) {
                log.info("Đã gieo giờ hành chính mặc định cho {} bác sĩ chưa có ca cố định.", so);
            }
        } catch (Exception ex) {
            log.warn("Không thể gieo lịch cố định mặc định lúc khởi động: {}", ex.getMessage());
        }
    }
}
