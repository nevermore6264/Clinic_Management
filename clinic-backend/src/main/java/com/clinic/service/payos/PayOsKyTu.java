package com.clinic.service.payos;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;

/**
 * Chữ ký HMAC SHA256 theo tài liệu PayOS (tạo link & webhook).
 */
public final class PayOsKyTu {

    private PayOsKyTu() {}

    /** Chuỗi ký khi tạo payment-requests: amount&cancelUrl&description&orderCode&returnUrl (đã sắp alphabet). */
    public static String kyTaoLinkThanhToan(
            int amount,
            String cancelUrl,
            String description,
            int orderCode,
            String returnUrl,
            String checksumKey) {
        String data = "amount=" + amount
                + "&cancelUrl=" + cancelUrl
                + "&description=" + description
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;
        return hmacSha256Hex(data, checksumKey);
    }

    public static String hmacSha256Hex(String data, String checksumKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Không tạo được chữ ký PayOS", e);
        }
    }

    /**
     * Webhook: ký trên object data — key sắp alphabet, value null → rỗng, số → chuỗi không .0.
     */
    public static String kyWebhookData(Map<String, String> dataSorted, String checksumKey) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : dataSorted.entrySet()) {
            if (sb.length() > 0) sb.append('&');
            sb.append(e.getKey()).append('=').append(e.getValue() != null ? e.getValue() : "");
        }
        return hmacSha256Hex(sb.toString(), checksumKey);
    }

    /** Xác thực chữ ký payload webhook (object data). */
    public static boolean chuKyWebhookHopLe(com.fasterxml.jackson.databind.JsonNode data, String signatureHex, String checksumKey) {
        if (signatureHex == null || signatureHex.isBlank() || data == null || !data.isObject()) {
            return false;
        }
        TreeMap<String, String> map = new TreeMap<>();
        data.fields().forEachRemaining(e -> {
            String k = e.getKey();
            com.fasterxml.jackson.databind.JsonNode v = e.getValue();
            if (v == null || v.isNull() || v.isMissingNode()) {
                map.put(k, "");
            } else if (v.isNumber()) {
                if (v.isIntegralNumber()) {
                    map.put(k, String.valueOf(v.longValue()));
                } else {
                    map.put(k, v.asText());
                }
            } else if (v.isBoolean()) {
                map.put(k, String.valueOf(v.booleanValue()));
            } else {
                map.put(k, v.asText(""));
            }
        });
        String computed = kyWebhookData(map, checksumKey);
        return computed.equalsIgnoreCase(signatureHex.trim());
    }
}
