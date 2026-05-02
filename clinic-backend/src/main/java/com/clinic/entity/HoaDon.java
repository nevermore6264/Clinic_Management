package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hoa_don")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_lich_hen")
    private LichHen lichHen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_benh_nhan", nullable = false)
    private BenhNhan benhNhan;

    @Column(name = "tong_tien", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal tongTien = BigDecimal.ZERO;

    @Column(name = "so_tien_da_tra", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal soTienDaTra = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    @Builder.Default
    private TrangThaiHoaDon trangThai = TrangThaiHoaDon.CHO_THANH_TOAN;

    @Column(name = "so_hoa_don")
    private String soHoaDon;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @Column(name = "cap_nhat_luc")
    private Instant capNhatLuc;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietHoaDon> chiTiet = new ArrayList<>();

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GiaoDichThanhToan> giaoDichThanhToan = new ArrayList<>();

    @PrePersist
    void luuTruoc() {
        taoLuc = capNhatLuc = Instant.now();
        if (soHoaDon == null) {
            soHoaDon = "HD-" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    void capNhatSau() {
        capNhatLuc = Instant.now();
    }

    public enum TrangThaiHoaDon {
        CHO_THANH_TOAN,
        MOT_PHAN,
        DA_THANH_TOAN,
        HUY
    }
}
