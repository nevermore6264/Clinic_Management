package com.clinic.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.payos")
public class PayOsProperties {
    private String clientId = "";
    private String apiKey = "";
    private String checksumKey = "";
    private String frontendBaseUrl = "";

    public boolean daCauHinh() {
        return clientId != null && !clientId.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && checksumKey != null && !checksumKey.isBlank();
    }
}
