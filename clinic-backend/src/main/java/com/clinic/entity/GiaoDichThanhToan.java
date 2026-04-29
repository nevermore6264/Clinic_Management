package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "giao_dich_thanh_toan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @Column(name = "so_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc", nullable = false)
    private PhuongThucThanhToan phuongThuc;

    @Column(name = "ma_tham_chieu")
    private String maThamChieu;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "luc_thanh_toan")
    private Instant lucThanhToan;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @PrePersist
    void luuTruoc() {
        if (lucThanhToan == null) lucThanhToan = Instant.now();
        taoLuc = Instant.now();
    }

    public enum PhuongThucThanhToan {
        TIEN_MAT,
        THE,
        CHUYEN_KHOAN,
        TRUC_TUYEN
    }
}
