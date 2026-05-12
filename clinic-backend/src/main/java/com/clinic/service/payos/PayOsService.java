package com.clinic.service.payos;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.clinic.config.PayOsProperties;
import com.clinic.dto.HoaDonDto;
import com.clinic.dto.payos.PayOsTaoLinkPhanHoi;
import com.clinic.entity.PayOsDonHang;
import com.clinic.repository.PayOsDonHangRepository;
import com.clinic.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOsService {

    private static final String PAYOS_TAO_LINK = "https://api-merchant.payos.vn/v2/payment-requests";

    private final PayOsProperties payOsProperties;
    private final HoaDonService hoaDonService;
    private final PayOsDonHangRepository payOsDonHangRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend-url:http://localhost:4009}")
    private String appFrontendUrl;

    public PayOsTaoLinkPhanHoi taoLinkChoHoaDon(Long maHoaDon) {
        if (!payOsProperties.daCauHinh()) {
            throw new RuntimeException("PayOS chưa cấu hình (app.payos.client-id, api-key, checksum-key).");
        }
        HoaDonDto hd = hoaDonService.layTheoMa(maHoaDon);
        BigDecimal remaining = hd.getTongTien().subtract(hd.getSoTienDaTra());
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Hóa đơn không còn số tiền cần thanh toán.");
        }
        int amount = remaining.setScale(0, RoundingMode.HALF_UP).intValueExact();
        if (amount < 1000) {
            throw new RuntimeException("Số tiền thanh toán quá nhỏ (tối thiểu 1.000đ).");
        }

        String base = payOsProperties.getFrontendBaseUrl() != null && !payOsProperties.getFrontendBaseUrl().isBlank()
                ? payOsProperties.getFrontendBaseUrl().trim()
                : appFrontendUrl.trim();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        String returnUrl = base + "/hoa-don/" + maHoaDon + "?payos=success";
        String cancelUrl = base + "/hoa-don/" + maHoaDon + "?payos=cancel";

        String desc = "HD" + maHoaDon;
        if (desc.length() > 9) {
            desc = desc.substring(desc.length() - 9);
        }

        int orderCode = sinhOrderCodeDuyNhat();
        String signature = PayOsKyTu.kyTaoLinkThanhToan(
                amount,
                cancelUrl,
                desc,
                orderCode,
                returnUrl,
                payOsProperties.getChecksumKey().trim());

        ObjectNode root = objectMapper.createObjectNode();
        root.put("orderCode", orderCode);
        root.put("amount", amount);
        root.put("description", desc);
        root.put("cancelUrl", cancelUrl);
        root.put("returnUrl", returnUrl);
        root.put("signature", signature);

        String jsonBody = root.toString();
        String resp;
        try {
            resp = RestClient.create()
                    .post()
                    .uri(PAYOS_TAO_LINK)
                    .header("x-client-id", payOsProperties.getClientId().trim())
                    .header("x-api-key", payOsProperties.getApiKey().trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonBody)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            log.warn("PayOS tạo link thất bại: {}", e.getMessage());
            throw new RuntimeException("Không tạo được link PayOS: " + e.getMessage());
        }

        JsonNode tree;
        try {
            tree = objectMapper.readTree(resp);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("PayOS trả JSON không hợp lệ.", e);
        }
        if (!"00".equals(tree.path("code").asText())) {
            throw new RuntimeException("PayOS từ chối: " + tree.path("desc").asText("Lỗi không xác định"));
        }
        JsonNode data = tree.path("data");
        String checkoutUrl = data.path("checkoutUrl").asText(null);
        String qrCode = data.path("qrCode").asText(null);
        String accountNumber = data.path("accountNumber").asText(null);
        String accountName = data.path("accountName").asText(null);
        String paymentLinkId = data.path("paymentLinkId").asText(null);

        if (checkoutUrl == null || checkoutUrl.isBlank()) {
            throw new RuntimeException("PayOS không trả checkoutUrl.");
        }

        PayOsDonHang luu = PayOsDonHang.builder()
                .maHoaDon(maHoaDon)
                .orderCode(orderCode)
                .soTienVnd(amount)
                .paymentLinkId(paymentLinkId)
                .daXuLyWebhook(false)
                .build();
        payOsDonHangRepository.save(luu);

        return PayOsTaoLinkPhanHoi.builder()
                .checkoutUrl(checkoutUrl)
                .qrCode(qrCode != null ? qrCode : "")
                .accountNumber(accountNumber != null ? accountNumber : "")
                .accountName(accountName != null ? accountName : "")
                .amount(amount)
                .orderCode(orderCode)
                .description(desc)
                .build();
    }

    private int sinhOrderCodeDuyNhat() {
        for (int i = 0; i < 50; i++) {
            int code = ThreadLocalRandom.current().nextInt(1_000_000, Integer.MAX_VALUE);
            if (!payOsDonHangRepository.existsByOrderCode(code)) {
                return code;
            }
        }
        throw new RuntimeException("Không sinh được mã đơn PayOS duy nhất.");
    }
}
