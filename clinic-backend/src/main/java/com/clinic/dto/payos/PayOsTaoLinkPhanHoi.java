package com.clinic.dto.payos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayOsTaoLinkPhanHoi {
    private String checkoutUrl;
    private String qrCode;
    private String accountNumber;
    private String accountName;
    private int amount;
    private int orderCode;
    private String description;
}
