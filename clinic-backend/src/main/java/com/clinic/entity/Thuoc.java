package com.clinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Danh mục thuốc trong phòng khám (dùng cho đơn thuốc có cấu trúc).
 */
@Entity
@Table(name = "thuoc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Thuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "ten_thuoc", nullable = false)
    private String tenThuoc;

    @Column(name = "don_vi", length = 50)
    private String donVi;

    @Column(name = "hoat_chat", length = 500)
    private String hoatChat;

    @Column(name = "gia_ban", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "hoat_dong")
    @Builder.Default
    private boolean hoatDong = true;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @Column(name = "cap_nhat_luc")
    private Instant capNhatLuc;

    @PrePersist
    void luuTruoc() {
        taoLuc = capNhatLuc = Instant.now();
    }

    @PreUpdate
    void capNhatSau() {
        capNhatLuc = Instant.now();
    }
}
