package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "ma_khoi_phuc_mat_khau", indexes = {
        @Index(name = "idx_ma_khoi_phuc_token", columnList = "token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaKhoiPhucMatKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ma_nguoi_dung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "token", nullable = false, unique = true, length = 128)
    private String token;

    @Column(name = "het_han_luc", nullable = false)
    private Instant hetHanLuc;

    @Column(name = "da_su_dung", nullable = false)
    @Builder.Default
    private boolean daSuDung = false;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @PrePersist
    void luuTruoc() {
        if (taoLuc == null) {
            taoLuc = Instant.now();
        }
    }

    public boolean conHieuLuc() {
        return !daSuDung && hetHanLuc != null && hetHanLuc.isAfter(Instant.now());
    }
}
