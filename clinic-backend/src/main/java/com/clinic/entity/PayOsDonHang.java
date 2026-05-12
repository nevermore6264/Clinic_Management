package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Ánh xạ orderCode PayOS → hóa đơn (webhook xác định hóa đơn cần ghi nhận thanh toán).
 */
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

    /** Số tiền (VNĐ) gửi PayOS */
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
