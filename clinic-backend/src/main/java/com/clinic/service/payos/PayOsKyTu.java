package com.clinic.service.payos;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public final class PayOsKyTu {

    private static final ObjectMapper PAYOS_JSON = new ObjectMapper();

    private PayOsKyTu() {}

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

    public static String kyWebhookData(Map<String, String> dataSorted, String checksumKey) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : dataSorted.entrySet()) {
            if (sb.length() > 0) sb.append('&');
            sb.append(e.getKey()).append('=').append(e.getValue() != null ? e.getValue() : "");
        }
        return hmacSha256Hex(sb.toString(), checksumKey);
    }

    public static boolean chuKyWebhookHopLe(JsonNode data, String signatureHex, String checksumKey) {
        if (signatureHex == null || signatureHex.isBlank() || data == null || !data.isObject()) {
            return false;
        }
        try {
            TreeMap<String, String> map = new TreeMap<>();
            for (Iterator<Map.Entry<String, JsonNode>> it = data.fields(); it.hasNext(); ) {
                Map.Entry<String, JsonNode> e = it.next();
                String k = e.getKey();
                JsonNode v = e.getValue();
                if (v == null || v.isNull() || v.isMissingNode()) {
                    map.put(k, "");
                } else if (v.isNumber()) {
                    if (v.isIntegralNumber()) {
                        map.put(k, String.valueOf(v.longValue()));
                    } else {
                        map.put(k, BigDecimal.valueOf(v.doubleValue()).stripTrailingZeros().toPlainString());
                    }
                } else if (v.isBoolean()) {
                    map.put(k, String.valueOf(v.booleanValue()));
                } else if (v.isTextual()) {
                    map.put(k, v.asText(""));
                } else if (v.isArray() || v.isObject()) {
                    Object plain = PAYOS_JSON.convertValue(v, Object.class);
                    map.put(k, PAYOS_JSON.writeValueAsString(deepSortMapKeys(plain)));
                } else {
                    map.put(k, PAYOS_JSON.writeValueAsString(PAYOS_JSON.convertValue(v, Object.class)));
                }
            }
            String computed = kyWebhookData(map, checksumKey);
            return computed.equalsIgnoreCase(signatureHex.trim());
        } catch (IllegalArgumentException | JsonProcessingException ex) {
            return false;
        }
    }

    private static Object deepSortMapKeys(Object o) {
        if (o instanceof Map<?, ?> m) {
            TreeMap<String, Object> sorted = new TreeMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) {
                sorted.put(String.valueOf(e.getKey()), deepSortMapKeys(e.getValue()));
            }
            return sorted;
        }
        if (o instanceof List<?> list) {
            List<Object> out = new ArrayList<>(list.size());
            for (Object item : list) {
                out.add(deepSortMapKeys(item));
            }
            return out;
        }
        return o;
    }
}
