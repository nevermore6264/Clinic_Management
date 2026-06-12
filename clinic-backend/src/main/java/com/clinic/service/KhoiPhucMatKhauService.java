package com.clinic.service;

import com.clinic.dto.DatLaiMatKhauYeuCau;
import com.clinic.dto.QuenMatKhauYeuCau;
import com.clinic.entity.MaKhoiPhucMatKhau;
import com.clinic.entity.NguoiDung;
import com.clinic.repository.MaKhoiPhucMatKhauRepository;
import com.clinic.repository.NguoiDungRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class KhoiPhucMatKhauService {

    private static final String TEN_PHONG_KHAM = "Phòng khám MEDLATEC";
    private static final long SO_PHUT_HET_HAN = 30;

    private final NguoiDungRepository nguoiDungRepository;
    private final MaKhoiPhucMatKhauRepository khoToken;
    private final PasswordEncoder maHoaMatKhau;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    @Value("${spring.mail.username:}")
    private String mailTu;

    @Value("${app.frontend-url:http://localhost:4009}")
    private String frontendUrl;

    @Transactional
    public void yeuCauKhoiPhuc(QuenMatKhauYeuCau yeuCau) {
        String dinhDanh = yeuCau.getDinhDanh() != null ? yeuCau.getDinhDanh().trim() : "";
        if (dinhDanh.isEmpty()) {
            return;
        }
        NguoiDung nguoiDung = timNguoiDung(dinhDanh).orElse(null);
        if (nguoiDung == null || !nguoiDung.isHoatDong()) {
            // Không tiết lộ tài khoản có tồn tại hay không.
            return;
        }
        String email = nguoiDung.getThuDienTu();
        if (email == null || email.isBlank()) {
            // Tài khoản không có email để gửi liên kết — bỏ qua âm thầm.
            return;
        }
        if (mailTu == null || mailTu.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Hệ thống chưa cấu hình gửi email. Vui lòng liên hệ quản trị.");
        }

        khoToken.vohieuHoaTatCa(nguoiDung);
        String token = taoToken();
        MaKhoiPhucMatKhau ma = MaKhoiPhucMatKhau.builder()
                .nguoiDung(nguoiDung)
                .token(token)
                .hetHanLuc(Instant.now().plus(SO_PHUT_HET_HAN, ChronoUnit.MINUTES))
                .daSuDung(false)
                .build();
        khoToken.save(ma);

        try {
            guiThuKhoiPhuc(nguoiDung, email, token);
        } catch (Exception e) {
            log.warn("Gửi email khôi phục mật khẩu thất bại: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Không gửi được email khôi phục. Vui lòng thử lại sau.");
        }
    }

    @Transactional(readOnly = true)
    public boolean tokenConHieuLuc(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return khoToken.findByToken(token.trim())
                .map(MaKhoiPhucMatKhau::conHieuLuc)
                .orElse(false);
    }

    @Transactional
    public void datLaiMatKhau(DatLaiMatKhauYeuCau yeuCau) {
        String token = yeuCau.getToken() != null ? yeuCau.getToken().trim() : "";
        String mkMoi = yeuCau.getMatKhauMoi();
        if (mkMoi == null || mkMoi.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cần tối thiểu 6 ký tự");
        }
        MaKhoiPhucMatKhau ma = khoToken.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Liên kết đặt lại mật khẩu không hợp lệ."));
        if (!ma.conHieuLuc()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu lại.");
        }
        NguoiDung nguoiDung = ma.getNguoiDung();
        nguoiDung.setMatKhauBam(maHoaMatKhau.encode(mkMoi));
        nguoiDungRepository.save(nguoiDung);
        ma.setDaSuDung(true);
        khoToken.save(ma);
    }

    private Optional<NguoiDung> timNguoiDung(String dinhDanh) {
        Optional<NguoiDung> theoTen = nguoiDungRepository.findByTenDangNhap(dinhDanh);
        if (theoTen.isPresent()) {
            return theoTen;
        }
        List<NguoiDung> theoEmail = nguoiDungRepository.findByThuDienTuIgnoreCase(dinhDanh);
        if (theoEmail.size() == 1) {
            return Optional.of(theoEmail.get(0));
        }
        // Nếu nhiều tài khoản trùng email, không thể xác định duy nhất → bỏ qua.
        return Optional.empty();
    }

    private String taoToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String linkDatLai(String token) {
        String base = frontendUrl == null ? "" : frontendUrl.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        // Token sinh ở dạng base64url không padding nên an toàn để nối thẳng vào URL.
        return base + "/dat-lai-mat-khau?token=" + token;
    }

    private void guiThuKhoiPhuc(NguoiDung nguoiDung, String email, String token)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        if (mailTu != null && !mailTu.isBlank()) {
            helper.setFrom(mailTu, TEN_PHONG_KHAM);
        }
        helper.setTo(email);
        helper.setSubject("Đặt lại mật khẩu — " + TEN_PHONG_KHAM);
        helper.setText(noiDungThuong(nguoiDung, token), noiDungHtml(nguoiDung, token));
        mailSender.send(message);
    }

    private String noiDungThuong(NguoiDung nd, String token) {
        String ten = nd.getHoTen() != null && !nd.getHoTen().isBlank() ? nd.getHoTen() : nd.getTenDangNhap();
        StringBuilder b = new StringBuilder();
        b.append("══════════════════════════════════════\n");
        b.append("  ĐẶT LẠI MẬT KHẨU — ").append(TEN_PHONG_KHAM).append("\n");
        b.append("══════════════════════════════════════\n\n");
        b.append("Kính gửi ").append(ten).append(",\n\n");
        b.append("Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản « ")
                .append(nd.getTenDangNhap()).append(" ».\n\n");
        b.append("Vui lòng mở liên kết dưới đây để đặt mật khẩu mới (hiệu lực trong ")
                .append(SO_PHUT_HET_HAN).append(" phút):\n");
        b.append(linkDatLai(token)).append("\n\n");
        b.append("Nếu bạn không yêu cầu, vui lòng bỏ qua thư này. Mật khẩu hiện tại vẫn được giữ nguyên.\n\n");
        b.append("Kính trọng báo tin,\n").append(TEN_PHONG_KHAM).append("\n");
        return b.toString();
    }

    private String noiDungHtml(NguoiDung nd, String token) {
        String ten = esc(nd.getHoTen() != null && !nd.getHoTen().isBlank() ? nd.getHoTen() : nd.getTenDangNhap());
        String tenDn = esc(nd.getTenDangNhap());
        String link = esc(linkDatLai(token));
        return """
                <!DOCTYPE html>
                <html lang="vi"><head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:Segoe UI,Arial,sans-serif;">
                <table role="presentation" width="100%%" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">
                <tr><td style="height:4px;background:linear-gradient(90deg,#1e3a5f,#c5a572);"></td></tr>
                <tr><td style="padding:28px 32px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1e3a5f;">Bảo mật tài khoản</p>
                <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">Đặt lại mật khẩu</h1>
                <p style="margin:0 0 16px;line-height:1.6;color:#334155;">Kính gửi <strong>%s</strong>, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>%s</strong>.</p>
                <p style="margin:0 0 20px;line-height:1.6;color:#334155;">Nhấn nút dưới đây để tạo mật khẩu mới. Liên kết có hiệu lực trong <strong>%d phút</strong>.</p>
                <p style="margin:0 0 20px;"><a href="%s" style="display:inline-block;padding:13px 30px;background:#1e3a5f;color:#fff !important;text-decoration:none;font-weight:600;border-radius:4px;">Đặt lại mật khẩu</a></p>
                <p style="margin:0 0 8px;font-size:12px;color:#64748b;word-break:break-all;">Hoặc sao chép liên kết: %s</p>
                <p style="margin:16px 0 0;line-height:1.6;color:#334155;font-size:13px;">Nếu bạn không yêu cầu, vui lòng bỏ qua thư này — mật khẩu hiện tại vẫn được giữ nguyên.</p>
                </td></tr></table></body></html>
                """.formatted(ten, tenDn, SO_PHUT_HET_HAN, link, link);
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
