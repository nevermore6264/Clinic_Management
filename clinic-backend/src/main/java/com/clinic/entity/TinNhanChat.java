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

    /** Tin nhắn riêng (1–1); null = tin theo phòng chung (legacy). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nguoi_nhan")
    private NguoiDung nguoiNhan;

    @Column(name = "noi_dung", nullable = false, length = 2000)
    private String noiDung;

    /** Đường dẫn API tải tệp, ví dụ /api/tro-chuyen/tep/uuid.pdf */
    @Column(name = "dinh_kem_duong_dan", length = 512)
    private String dinhKemDuongDan;

    @Column(name = "dinh_kem_ten", length = 255)
    private String dinhKemTen;

    @Column(name = "dinh_kem_loai", length = 128)
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
