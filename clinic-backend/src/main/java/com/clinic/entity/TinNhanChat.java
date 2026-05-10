package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tin_nhan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TinNhanChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nguoi_gui", nullable = false)
    private NguoiDung nguoiGui;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nguoi_nhan")
    private NguoiDung nguoiNhan;

    @Column(
            name = "noi_dung",
            nullable = false,
            columnDefinition = "varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
    private String noiDung;

    @Column(
            name = "dinh_kem_duong_dan",
            columnDefinition = "varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String dinhKemDuongDan;

    @Column(
            name = "dinh_kem_ten",
            columnDefinition = "varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String dinhKemTen;

    @Column(
            name = "dinh_kem_loai",
            columnDefinition = "varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String dinhKemLoai;

    @Column(name = "ma_phong")
    @Builder.Default
    private Long maPhong = 1L;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @PrePersist
    void luuTruoc() {
        if (taoLuc == null) taoLuc = Instant.now();
    }
}
