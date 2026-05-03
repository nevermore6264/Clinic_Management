package com.clinic.service;

import com.clinic.dto.CauHinhNhacLichDto;
import com.clinic.entity.CauHinhNhacLich;
import com.clinic.entity.LichHen;
import com.clinic.entity.NhatKyNhacLich;
import com.clinic.repository.CauHinhNhacLichRepository;
import com.clinic.repository.LichHenRepository;
import com.clinic.repository.NhatKyNhacLichRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NhacLichHenService {

    private final CauHinhNhacLichRepository khoCauHinh;
    private final NhatKyNhacLichRepository khoNhatKy;
    private final LichHenRepository khoLichHen;
    private final JavaMailSender mailSender;

    @Transactional(readOnly = true)
    public CauHinhNhacLichDto layCauHinh() {
        List<CauHinhNhacLich> tatCa = khoCauHinh.findAll(PageRequest.of(0, 1)).getContent();
        if (tatCa.isEmpty()) return macDinh();
        return sangDto(tatCa.get(0));
    }

    @Transactional
    public CauHinhNhacLichDto luuCauHinh(CauHinhNhacLichDto dto) {
        List<CauHinhNhacLich> tatCa = khoCauHinh.findAll(PageRequest.of(0, 1)).getContent();
        CauHinhNhacLich cauHinh = tatCa.isEmpty() ? new CauHinhNhacLich() : tatCa.get(0);
        cauHinh.setSoNgayTruoc(dto.getSoNgayTruoc() != null ? dto.getSoNgayTruoc() : 1);
        cauHinh.setSoGioTruoc(dto.getSoGioTruoc() != null ? dto.getSoGioTruoc() : 2);
        cauHinh.setBatThuDienTu(dto.isBatThuDienTu());
        cauHinh = khoCauHinh.save(cauHinh);
        return sangDto(cauHinh);
    }

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void guiNhacLich() {
        List<CauHinhNhacLich> tatCa = khoCauHinh.findAll(PageRequest.of(0, 1)).getContent();
        if (tatCa.isEmpty() || !tatCa.get(0).isBatThuDienTu()) return;
        CauHinhNhacLich cauHinh = tatCa.get(0);
        ZoneId vung = ZoneId.systemDefault();
        LocalDateTime bayGio = LocalDateTime.now(vung);

        for (int buocNgay = 0; buocNgay <= cauHinh.getSoNgayTruoc(); buocNgay++) {
            LocalDate mucTieu = bayGio.toLocalDate().plusDays(buocNgay);
            List<LichHen> lichHen = khoLichHen
                    .findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(mucTieu, mucTieu, PageRequest.of(0, 200))
                    .getContent();
            for (LichHen lh : lichHen) {
                if (lh.getTrangThai() == LichHen.TrangThaiLichHen.HUY || lh.getTrangThai() == LichHen.TrangThaiLichHen.VANG)
                    continue;
                LocalDateTime lucHen = LocalDateTime.of(lh.getNgayHen(), lh.getGioHen());
                long conLaiGio = java.time.Duration.between(bayGio, lucHen).toHours();
                boolean nhacTheoNgay = buocNgay == cauHinh.getSoNgayTruoc() && conLaiGio <= 24 && conLaiGio > 23;
                boolean nhacTheoGio = conLaiGio <= cauHinh.getSoGioTruoc() && conLaiGio > cauHinh.getSoGioTruoc() - 1;
                if (!nhacTheoNgay && !nhacTheoGio) continue;
                if (khoNhatKy.findByLichHenIdAndKenh(lh.getId(), NhatKyNhacLich.KenhNhac.THU_DIEN_TU).isPresent())
                    continue;
                String thu = lh.getBenhNhan().getThuDienTu();
                if (thu == null || thu.isBlank()) continue;
                try {
                    SimpleMailMessage tin = new SimpleMailMessage();
                    tin.setTo(thu);
                    tin.setSubject("Nhắc lịch khám - " + lh.getNgayHen() + " " + lh.getGioHen());
                    tin.setText("Kính gửi " + lh.getBenhNhan().getHoTen() + ",\n\nPhòng khám nhắc bạn có lịch khám vào "
                            + lh.getNgayHen() + " lúc " + lh.getGioHen()
                            + " với bác sĩ. Vui lòng có mặt đúng giờ.\n\nTrân trọng.");
                    mailSender.send(tin);
                    khoNhatKy.save(NhatKyNhacLich.builder()
                            .lichHen(lh)
                            .kenh(NhatKyNhacLich.KenhNhac.THU_DIEN_TU)
                            .build());
                } catch (Exception e) {
                    log.warn("Gửi email nhắc lịch thất bại: {}", e.getMessage());
                }
            }
        }
    }

    private CauHinhNhacLichDto sangDto(CauHinhNhacLich c) {
        CauHinhNhacLichDto dto = new CauHinhNhacLichDto();
        dto.setId(c.getId());
        dto.setSoNgayTruoc(c.getSoNgayTruoc());
        dto.setSoGioTruoc(c.getSoGioTruoc());
        dto.setBatThuDienTu(c.isBatThuDienTu());
        return dto;
    }

    private CauHinhNhacLichDto macDinh() {
        CauHinhNhacLichDto dto = new CauHinhNhacLichDto();
        dto.setSoNgayTruoc(1);
        dto.setSoGioTruoc(2);
        dto.setBatThuDienTu(true);
        return dto;
    }
}
