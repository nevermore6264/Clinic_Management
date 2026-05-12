package com.clinic.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cấu hình PayOS — đặt trong application.properties hoặc biến môi trường, không commit secret.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.payos")
public class PayOsProperties {
    /** Bật khi đủ client-id, api-key, checksum-key */
    private String clientId = "";
    private String apiKey = "";
    private String checksumKey = "";
    /** Mặc định dùng app.frontend-url */
    private String frontendBaseUrl = "";

    public boolean daCauHinh() {
        return clientId != null && !clientId.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && checksumKey != null && !checksumKey.isBlank();
    }
}
