package com.clinic.service;

import com.clinic.dto.CauHinhNhacLichDto;
import com.clinic.entity.CauHinhNhacLich;
import com.clinic.entity.LichHen;
import com.clinic.entity.NhatKyNhacLich;
import com.clinic.repository.CauHinhNhacLichRepository;
import com.clinic.repository.LichHenRepository;
import com.clinic.repository.NhatKyNhacLichRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class NhacLichHenService {

    private static final String TEN_PHONG_KHAM = "Phòng khám MEDLATEC";

    private final CauHinhNhacLichRepository khoCauHinh;
    private final NhatKyNhacLichRepository khoNhatKy;
    private final LichHenRepository khoLichHen;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailTu;

    @Value("${app.frontend-url:http://localhost:4009}")
    private String frontendUrl;

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

    @Transactional
    public void guiNhacThuCong(Long maLichHen) {
        if (mailTu == null || mailTu.isBlank()) {
            throw new IllegalStateException("Chưa cấu hình gửi email (spring.mail.username).");
        }
        LichHen lh = khoLichHen.findById(maLichHen)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lịch hẹn."));
        if (lh.getTrangThai() == LichHen.TrangThaiLichHen.HUY
                || lh.getTrangThai() == LichHen.TrangThaiLichHen.VANG) {
            throw new IllegalArgumentException("Không gửi nhắc cho lịch đã hủy hoặc vắng.");
        }
        String thu = lh.getBenhNhan().getThuDienTu();
        if (thu == null || thu.isBlank()) {
            throw new IllegalArgumentException("Bệnh nhân chưa có email trên hồ sơ.");
        }
        try {
            guiThuNhacHtml(lh, true);
        } catch (Exception e) {
            log.warn("Gửi email nhắc lịch thủ công thất bại: {}", e.getMessage());
            throw new IllegalStateException("Gửi email thất bại: " + e.getMessage());
        }
        if (khoNhatKy.findByLichHenIdAndKenh(lh.getId(), NhatKyNhacLich.KenhNhac.THU_DIEN_TU).isEmpty()) {
            khoNhatKy.save(NhatKyNhacLich.builder()
                    .lichHen(lh)
                    .kenh(NhatKyNhacLich.KenhNhac.THU_DIEN_TU)
                    .build());
        }
    }

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void guiNhacLich() {
        if (mailTu == null || mailTu.isBlank()) {
            return;
        }
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
                    guiThuNhacHtml(lh, false);
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

    private void guiThuNhacHtml(LichHen lh, boolean thuCong) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        if (mailTu != null && !mailTu.isBlank()) {
            helper.setFrom(mailTu, TEN_PHONG_KHAM);
        }
        helper.setTo(lh.getBenhNhan().getThuDienTu());
        helper.setSubject(tieuDeThuNhac(lh));
        helper.setText(noiDungThuong(lh, thuCong), noiDungHtml(lh, thuCong));
        mailSender.send(message);
    }

    private String tieuDeThuNhac(LichHen lh) {
        Locale vi = Locale.forLanguageTag("vi-VN");
        String thu = lh.getNgayHen().format(DateTimeFormatter.ofPattern("EEEE", vi));
        if (!thu.isEmpty()) {
            thu = Character.toUpperCase(thu.charAt(0)) + thu.substring(1);
        }
        String ngay = lh.getNgayHen().format(DateTimeFormatter.ofPattern("dd/MM/yyyy", vi));
        String gio = lh.getGioHen().format(DateTimeFormatter.ofPattern("HH:mm"));
        String bs = tenBacSiHienThi(lh);
        String bsTrongTieuDe = ("bác sĩ".equalsIgnoreCase(bs)) ? "theo phân công của phòng khám" : "BS. " + bs;
        return "Thư nhắc lịch hẹn khám — " + TEN_PHONG_KHAM + " | " + thu + ", " + ngay + ", " + gio + " | " + bsTrongTieuDe;
    }

    private String tenBacSiHienThi(LichHen lh) {
        if (lh.getBacSi() == null) {
            return "bác sĩ";
        }
        if (lh.getBacSi().getNguoiDung() != null
                && lh.getBacSi().getNguoiDung().getHoTen() != null
                && !lh.getBacSi().getNguoiDung().getHoTen().isBlank()) {
            return lh.getBacSi().getNguoiDung().getHoTen().trim();
        }
        if (lh.getBacSi().getHoTen() != null && !lh.getBacSi().getHoTen().isBlank()) {
            return lh.getBacSi().getHoTen().trim();
        }
        return "bác sĩ";
    }

    private String tenDichVuHienThi(LichHen lh) {
        if (lh.getDichVu() == null || lh.getDichVu().getTen() == null || lh.getDichVu().getTen().isBlank()) {
            return "—";
        }
        return lh.getDichVu().getTen().trim();
    }

    private String dongThoiGianHen(LichHen lh) {
        Locale vi = Locale.forLanguageTag("vi-VN");
        String thu = lh.getNgayHen().format(DateTimeFormatter.ofPattern("EEEE", vi));
        if (!thu.isEmpty()) {
            thu = Character.toUpperCase(thu.charAt(0)) + thu.substring(1);
        }
        String ngay = lh.getNgayHen().format(DateTimeFormatter.ofPattern("dd/MM/yyyy", vi));
        String gio = lh.getGioHen().format(DateTimeFormatter.ofPattern("HH:mm"));
        return thu + ", " + ngay + " lúc " + gio;
    }

    private String linkChiTietLich(LichHen lh) {
        String base = frontendUrl == null ? "" : frontendUrl.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/lich-hen/" + lh.getId();
    }

    private String noiDungThuong(LichHen lh, boolean thuCong) {
        StringBuilder b = new StringBuilder();
        b.append("══════════════════════════════════════\n");
        b.append("  THÔNG BÁO CHÍNH THỨC — ").append(TEN_PHONG_KHAM).append("\n");
        b.append("  THƯ NHẮC LỊCH HẸN KHÁM\n");
        b.append("══════════════════════════════════════\n\n");
        b.append("Kính gửi Quý khách ").append(lh.getBenhNhan().getHoTen()).append(",\n\n");
        b.append(TEN_PHONG_KHAM).append(" trân trọng thông báo: Quý khách có lịch hẹn khám với thông tin chi tiết như sau.\n\n");
        b.append("— Thời gian hẹn khám: ").append(dongThoiGianHen(lh)).append("\n");
        b.append("— Bác sĩ phụ trách: ").append(tenBacSiHienThi(lh)).append("\n");
        b.append("— Hạng mục / dịch vụ: ").append(tenDichVuHienThi(lh)).append("\n\n");
        b.append("Quý khách vui lòng có mặt trước giờ hẹn ít nhất 10–15 phút để hoàn tất thủ tục tiếp nhận.\n");
        b.append("Trường hợp cần đổi lịch hoặc hủy hẹn, xin liên hệ ").append(TEN_PHONG_KHAM).append(" qua đường dây nóng hoặc quầy lễ tân.\n\n");
        if (thuCong) {
            b.append("[Ghi chú] Thư được gửi theo yêu cầu từ quầy tiếp nhận.\n\n");
        }
        b.append("Đường dẫn xem chi tiết lịch hẹn trên hệ thống:\n").append(linkChiTietLich(lh)).append("\n\n");
        b.append("Kính trọng báo tin,\n").append(TEN_PHONG_KHAM).append("\n");
        b.append("—\n");
        b.append("Thư điện tử thông báo tự động. Quý khách không cần trả lời trực tiếp thư này.\n");
        return b.toString();
    }

    private String noiDungHtml(LichHen lh, boolean thuCong) {
        String tenBn = esc(lh.getBenhNhan().getHoTen());
        String bs = esc(tenBacSiHienThi(lh));
        String dv = esc(tenDichVuHienThi(lh));
        String khi = esc(dongThoiGianHen(lh));
        String linkRaw = linkChiTietLich(lh);
        String linkEsc = esc(linkRaw);
        String preheader = esc(TEN_PHONG_KHAM + " — Thư nhắc lịch hẹn khám của Quý khách vào " + dongThoiGianHen(lh));
        String ghiThuCong = thuCong
                ? """
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0;border-collapse:collapse;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;">
                  <tr>
                    <td style="padding:14px 18px;font-size:13px;color:#92400e;line-height:1.55;">
                      <strong style="display:block;margin-bottom:4px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#b45309;">Ghi chú từ quầy tiếp nhận</strong>
                      Thư được gửi theo yêu cầu trực tiếp từ quầy lễ tân nhằm hỗ trợ Quý khách theo dõi lịch hẹn.
                    </td>
                  </tr>
                </table>
                """
                : "";

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>Thư nhắc lịch hẹn khám</title>
                <!--[if mso]>
                <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
                <![endif]-->
                </head>
                <body style="margin:0;padding:0;background:#e8edf3;-webkit-text-size-adjust:100%;">
                <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#e8edf3;">
                """
                + preheader
                + """
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e8edf3;padding:32px 12px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;border-collapse:collapse;background:#ffffff;border-radius:2px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.12);border:1px solid #d4dce6;">
                        <tr>
                          <td style="height:5px;background:linear-gradient(90deg,#1e3a5f 0%,#0f2744 35%,#c5a572 100%);font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td style="padding:32px 40px 28px;background:linear-gradient(180deg,#1e3a5f 0%,#152a45 100%);color:#f8fafc;">
                            <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#c5a572;">Thông báo chính thức</p>
                            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:600;line-height:1.25;letter-spacing:-0.02em;">Thư nhắc lịch hẹn khám</h1>
                            <p style="margin:12px 0 0;font-size:14px;line-height:1.55;opacity:0.88;border-left:3px solid #c5a572;padding-left:14px;">
                              """
                + esc(TEN_PHONG_KHAM)
                + """
                               trân trọng kính báo tin tới Quý khách về lịch hẹn đã được xác nhận trên hệ thống.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:36px 40px 8px;color:#0f172a;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;">
                            <p style="margin:0 0 18px;font-size:15px;">Kính gửi Quý khách <strong style="color:#1e3a5f;">"""
                + tenBn
                + """
                </strong>,</p>
                            <p style="margin:0 0 26px;color:#334155;">
                              Theo sổ hẹn của phòng khám, Quý khách có lịch khám với các nội dung được tóm tắt dưới đây. Xin Quý khách lưu giữ thư này để thuận tiện khi đến khám.
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#f4f7fb;border:1px solid #c9d4e3;border-radius:2px;">
                              <tr>
                                <td style="padding:22px 24px;border-left:4px solid #1e3a5f;">
                                  <p style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Nội dung lịch hẹn</p>
                                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                                    """
                + hangBang("Thời gian hẹn", khi, false)
                + hangBang("Bác sĩ phụ trách", bs, false)
                + hangBang("Hạng mục / dịch vụ", dv, true)
                + """
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0 0;border-collapse:collapse;">
                              <tr>
                                <td style="padding:0 0 0 4px;border-left:2px solid #cbd5e1;">
                                  <p style="margin:0 0 8px 14px;font-size:13px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">Lưu ý</p>
                                  <ul style="margin:0;padding:0 0 0 30px;color:#334155;font-size:14px;line-height:1.7;">
                                    <li style="margin:0 0 6px;">Vui lòng có mặt <strong>trước giờ hẹn ít nhất 10–15 phút</strong> để hoàn tất thủ tục tiếp nhận.</li>
                                    <li style="margin:0 0 6px;">Mang theo giấy tờ tùy thân và các kết quả cận lâm sàng liên quan (nếu có).</li>
                                    <li style="margin:0;">Cần đổi lịch hoặc hủy hẹn, xin liên hệ """
                + esc(TEN_PHONG_KHAM)
                + """
                 qua đường dây nóng hoặc quầy lễ tân.</li>
                                  </ul>
                                </td>
                              </tr>
                            </table>
                            """
                + ghiThuCong
                + """
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0 0;border-collapse:collapse;">
                              <tr>
                                <td align="center" style="padding:8px 0 4px;">
                                  """
                + "<a href=\""
                + linkEsc
                + "\" style=\"display:inline-block;padding:14px 32px;background:#1e3a5f;color:#f8fafc !important;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.04em;border-radius:2px;border:1px solid #152a45;\">Xem chi tiết lịch hẹn trên hệ thống</a>"
                + """
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="padding:12px 0 0;font-size:12px;color:#64748b;word-break:break-all;">
                                  Hoặc sao chép đường dẫn: <span style="color:#1e3a5f;">"""
                + linkEsc
                + """
                </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:28px 40px 36px;border-top:1px solid #e2e8f0;background:#fafbfc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                            <p style="margin:0 0 6px;font-size:15px;color:#1e293b;font-style:italic;">Kính trọng báo tin,</p>
                            <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a5f;">"""
                + esc(TEN_PHONG_KHAM)
                + """
                </p>
                            <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">
                              Thư điện tử thông báo tự động từ hệ thống quản lý phòng khám. Quý khách không cần trả lời trực tiếp thư này.<br>
                              Nếu Quý khách không thực hiện đặt lịch, vui lòng liên hệ ngay với chúng tôi để được hỗ trợ.
                            </p>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:20px 0 0;font-size:11px;color:#64748b;font-family:'Segoe UI',Roboto,Arial,sans-serif;">© """
                + esc(TEN_PHONG_KHAM)
                + """
                 — Bảo mật thông tin bệnh nhân theo quy định.</p>
                    </td>
                  </tr>
                </table>
                </body>
                </html>
                """;
    }

    private static String hangBang(String tieuDe, String giaTri, boolean dongCuoi) {
        String vienDuoi = dongCuoi ? "none" : "1px solid #e2e8f0";
        return "<tr>"
                + "<td style=\"padding:10px 0;vertical-align:top;width:38%;font-size:13px;font-weight:600;color:#475569;border-bottom:"
                + vienDuoi + ";\">" + esc(tieuDe) + "</td>"
                + "<td style=\"padding:10px 0 10px 16px;vertical-align:top;font-size:15px;color:#0f172a;font-weight:500;border-bottom:"
                + vienDuoi + ";\">" + giaTri + "</td>"
                + "</tr>";
    }

    private static String esc(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
