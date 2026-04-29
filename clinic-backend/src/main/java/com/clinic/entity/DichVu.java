package com.clinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "dich_vu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "ten", nullable = false)
    private String ten;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_loai_dich_vu")
    private LoaiDichVu loaiDichVu;

    @Column(name = "mo_ta")
    private String moTa;

    @NotNull
    @Column(name = "gia", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal gia = BigDecimal.ZERO;

    @Column(name = "hoat_dong", nullable = false)
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
