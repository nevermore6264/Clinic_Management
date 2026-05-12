package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "pay_os_don_hang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayOsDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hoa_don", nullable = false)
    private Long maHoaDon;

    @Column(name = "order_code", nullable = false, unique = true)
    private Integer orderCode;

    @Column(name = "so_tien_vnd", nullable = false)
    private Integer soTienVnd;

    @Column(name = "payment_link_id", length = 64)
    private String paymentLinkId;

    @Column(name = "da_xu_ly_webhook", nullable = false)
    @Builder.Default
    private boolean daXuLyWebhook = false;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @PrePersist
    void tao() {
        if (taoLuc == null) taoLuc = Instant.now();
    }
}
