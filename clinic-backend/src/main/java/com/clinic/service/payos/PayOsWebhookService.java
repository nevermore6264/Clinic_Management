package com.clinic.service.payos;

import com.clinic.config.PayOsProperties;
import com.clinic.dto.GiaoDichThanhToanDto;
import com.clinic.dto.HoaDonDto;
import com.clinic.entity.GiaoDichThanhToan;
import com.clinic.entity.HoaDon;
import com.clinic.entity.PayOsDonHang;
import com.clinic.repository.GiaoDichThanhToanRepository;
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

    public static final String MA_THAM_CHIEU_PREFIX = "PAYOS-OC-";

    private final PayOsProperties payOsProperties;
    private final PayOsDonHangRepository payOsDonHangRepository;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final HoaDonService hoaDonService;
    private final HoaDonRepository hoaDonRepository;
    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public static String maThamChieuCoDinh(int orderCode) {
        return MA_THAM_CHIEU_PREFIX + orderCode;
    }

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

        int amountFromHook = data.path("amount").asInt(0);
        if (amountFromHook <= 0) {
            return;
        }
        if (amountFromHook != dh.getSoTienVnd()) {
            log.warn("PayOS webhook: amount {} khác số đã tạo link {}", amountFromHook, dh.getSoTienVnd());
        }

        ghiNhanTuDonHangNeuChuaXuLy(dh.getId(), amountFromHook);
    }

    @Transactional
    public void ghiNhanTuDonHangNeuChuaXuLy(Long payOsDonHangId, int soTienTuPayOsVnd) {
        PayOsDonHang dh = payOsDonHangRepository.findByIdForUpdate(payOsDonHangId).orElse(null);
        if (dh == null) {
            return;
        }
        if (dh.isDaXuLyWebhook()) {
            return;
        }
        if (soTienTuPayOsVnd <= 0) {
            return;
        }
        if (soTienTuPayOsVnd != dh.getSoTienVnd()) {
            log.warn("PayOS: số tiền {} khác số đã tạo link {}", soTienTuPayOsVnd, dh.getSoTienVnd());
        }

        String maThamChieu = maThamChieuCoDinh(dh.getOrderCode());
        Long maHoaDon = dh.getMaHoaDon();

        if (daCoGiaoDichPayOs(maHoaDon, dh.getOrderCode())) {
            log.info("PayOS: bỏ qua ghi nhận — đã có giao dịch {} cho hóa đơn {}", maThamChieu, maHoaDon);
            danhDauDonDaXuLy(dh);
            return;
        }

        HoaDon hdLock = hoaDonRepository.findByIdForUpdate(maHoaDon).orElse(null);
        if (hdLock == null) {
            return;
        }

        BigDecimal conLai = hdLock.getTongTien().subtract(hdLock.getSoTienDaTra());
        if (conLai.compareTo(BigDecimal.ZERO) <= 0) {
            danhDauDonDaXuLy(dh);
            return;
        }

        BigDecimal soTien = BigDecimal.valueOf(Math.min(soTienTuPayOsVnd, dh.getSoTienVnd()));
        soTien = soTien.min(conLai);
        if (soTien.compareTo(BigDecimal.ZERO) <= 0) {
            danhDauDonDaXuLy(dh);
            return;
        }

        GiaoDichThanhToanDto g = new GiaoDichThanhToanDto();
        g.setSoTien(soTien);
        g.setPhuongThuc(GiaoDichThanhToan.PhuongThucThanhToan.TRUC_TUYEN);
        g.setMaThamChieu(maThamChieu);

        hoaDonService.themThanhToan(maHoaDon, g);
        danhDauDonDaXuLy(dh);
        guiEmailXacNhanMotLan(maHoaDon);
    }

    private boolean daCoGiaoDichPayOs(Long maHoaDon, int orderCode) {
        return giaoDichThanhToanRepository.existsByHoaDon_IdAndMaThamChieu(
                maHoaDon, maThamChieuCoDinh(orderCode));
    }

    private void danhDauDonDaXuLy(PayOsDonHang dh) {
        dh.setDaXuLyWebhook(true);
        payOsDonHangRepository.save(dh);
        payOsDonHangRepository.danhDauDaXuLyTatCaDonChoHoaDon(dh.getMaHoaDon());
    }

    private void guiEmailXacNhanMotLan(Long maHoaDon) {
        if (mailUsername == null || mailUsername.isBlank()) {
            return;
        }
        if (hoaDonRepository.claimPayOsEmailXacNhan(maHoaDon) == 0) {
            log.debug("PayOS: bỏ qua email xác nhận — đã gửi cho hóa đơn {}", maHoaDon);
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
