package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "lich_hen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichHen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_benh_nhan", nullable = false)
    private BenhNhan benhNhan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bac_si", nullable = false)
    private BacSi bacSi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_dich_vu", nullable = false)
    private DichVu dichVu;

    @Column(name = "ngay_hen", nullable = false)
    private LocalDate ngayHen;

    @Column(name = "gio_hen", nullable = false)
    private LocalTime gioHen;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    @Builder.Default
    private TrangThaiLichHen trangThai = TrangThaiLichHen.DA_DAT;

    @Column(name = "ghi_chu")
    private String ghiChu;

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

    public enum TrangThaiLichHen {
        DA_DAT,
        DA_TIEP_NHAN,
        DANG_KHAM,
        XET_NGHIEM,
        DA_KE_DON,
        /** Đã có hóa đơn, đang chờ thanh toán đủ (đồng bộ với HĐ CHO_THANH_TOAN / MOT_PHAN). */
        CHO_THANH_TOAN,
        DA_THANH_TOAN,
        HUY,
        VANG
    }
}
