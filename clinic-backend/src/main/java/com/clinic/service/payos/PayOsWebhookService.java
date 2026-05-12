package com.clinic.service.payos;

import com.clinic.config.PayOsProperties;
import com.clinic.dto.GiaoDichThanhToanDto;
import com.clinic.dto.HoaDonDto;
import com.clinic.entity.GiaoDichThanhToan;
import com.clinic.entity.HoaDon;
import com.clinic.entity.PayOsDonHang;
import com.clinic.repository.HoaDonRepository;
import com.clinic.repository.PayOsDonHangRepository;
import com.clinic.service.HoaDonService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOsWebhookService {

    private final PayOsProperties payOsProperties;
    private final PayOsDonHangRepository payOsDonHangRepository;
    private final HoaDonService hoaDonService;
    private final HoaDonRepository hoaDonRepository;
    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Transactional
    public void xuLyWebhook(JsonNode root) {
        if (!payOsProperties.daCauHinh()) {
            return;
        }
        JsonNode data = root.get("data");
        if (data == null || !data.isObject()) {
            log.warn("PayOS webhook: thiếu data");
            return;
        }
        String sig = root.path("signature").asText("");
        if (!PayOsKyTu.chuKyWebhookHopLe(data, sig, payOsProperties.getChecksumKey().trim())) {
            log.warn("PayOS webhook: chữ ký không hợp lệ");
            return;
        }
        if (!"00".equals(root.path("code").asText("")) || !root.path("success").asBoolean(false)) {
            return;
        }
        if (!"00".equals(data.path("code").asText(""))) {
            return;
        }

        int orderCode = data.path("orderCode").asInt(0);
        if (orderCode == 0) {
            return;
        }
        PayOsDonHang dh = payOsDonHangRepository.findByOrderCode(orderCode).orElse(null);
        if (dh == null) {
            log.warn("PayOS webhook: không tìm thấy orderCode {}", orderCode);
            return;
        }
        if (dh.isDaXuLyWebhook()) {
            return;
        }

        int amountFromHook = data.path("amount").asInt(0);
        if (amountFromHook <= 0) {
            return;
        }
        if (amountFromHook != dh.getSoTienVnd()) {
            log.warn("PayOS webhook: amount {} khác số đã tạo link {}", amountFromHook, dh.getSoTienVnd());
        }

        HoaDonDto hd = hoaDonService.layTheoMaNoiBo(dh.getMaHoaDon());
        BigDecimal conLai = hd.getTongTien().subtract(hd.getSoTienDaTra());
        if (conLai.compareTo(BigDecimal.ZERO) <= 0) {
            dh.setDaXuLyWebhook(true);
            payOsDonHangRepository.save(dh);
            return;
        }

        BigDecimal soTien = BigDecimal.valueOf(Math.min(amountFromHook, dh.getSoTienVnd()));
        soTien = soTien.min(conLai);
        if (soTien.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String maThamChieu = data.path("reference").asText("");
        if (maThamChieu == null || maThamChieu.isBlank()) {
            maThamChieu = "PAYOS-" + orderCode;
        }

        GiaoDichThanhToanDto g = new GiaoDichThanhToanDto();
        g.setSoTien(soTien);
        g.setPhuongThuc(GiaoDichThanhToan.PhuongThucThanhToan.TRUC_TUYEN);
        g.setMaThamChieu(maThamChieu);

        hoaDonService.themThanhToan(dh.getMaHoaDon(), g);

        dh.setDaXuLyWebhook(true);
        payOsDonHangRepository.save(dh);

        guiEmailXacNhan(dh.getMaHoaDon());
    }

    private void guiEmailXacNhan(Long maHoaDon) {
        if (mailUsername == null || mailUsername.isBlank()) {
            return;
        }
        HoaDon hd = hoaDonRepository.findById(maHoaDon).orElse(null);
        if (hd == null || hd.getBenhNhan() == null) {
            return;
        }
        String to = hd.getBenhNhan().getThuDienTu();
        if (to == null || to.isBlank()) {
            return;
        }
        try {
            HoaDonDto dto = hoaDonService.layTheoMaNoiBo(maHoaDon);
            SimpleMailMessage m = new SimpleMailMessage();
            m.setFrom(mailUsername);
            m.setTo(to);
            m.setSubject("Xác nhận thanh toán hóa đơn #" + dto.getId());
            m.setText("Đã nhận thanh toán trực tuyến (PayOS) cho hóa đơn số "
                    + (dto.getSoHoaDon() != null ? dto.getSoHoaDon() : String.valueOf(dto.getId()))
                    + ". Tổng: " + dto.getTongTien() + " VNĐ, đã thanh toán: "
                    + dto.getSoTienDaTra() + " VNĐ.");
            javaMailSender.send(m);
        } catch (Exception e) {
            log.warn("PayOS: không gửi được email xác nhận: {}", e.getMessage());
        }
    }
}
