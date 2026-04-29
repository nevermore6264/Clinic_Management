package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_hoa_don")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietHoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_dich_vu", nullable = false)
    private DichVu dichVu;

    @Column(name = "don_gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal donGia;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong = 1;

    @Column(name = "thanh_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal thanhTien;
}
