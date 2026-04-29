package com.clinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Phiếu chi — chi phí vận hành phòng khám (minh bạch tài chính, bổ sung cho doanh thu).
 */
@Entity
@Table(name = "phieu_chi", indexes = @Index(name = "idx_pc_ngay", columnList = "ngay_chi"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuChi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "mo_ta", nullable = false, length = 500)
    private String moTa;

    @NotNull
    @Column(name = "so_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "ngay_chi", nullable = false)
    private LocalDate ngayChi;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", nullable = false)
    @Builder.Default
    private LoaiPhieuChi loai = LoaiPhieuChi.KHAC;

    @Column(name = "ma_nguoi_tao")
    private Long maNguoiTao;

    @Column(name = "ten_dang_nhap_nguoi_tao")
    private String tenDangNhapNguoiTao;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    public enum LoaiPhieuChi {
        VAT_TU,
        THIET_BI,
        LUONG,
        THUE,
        KHAC
    }

    @PrePersist
    void luuTruoc() {
        if (taoLuc == null) taoLuc = Instant.now();
    }
}
