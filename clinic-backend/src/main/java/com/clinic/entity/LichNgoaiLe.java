package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "lich_ngoai_le")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichNgoaiLe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_ngoai_le")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bac_si", nullable = false)
    private BacSi bacSi;

    @Column(name = "ngay_ngoai_le")
    private LocalDate ngayNgoaiLe;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_ngoai_le")
    private LoaiNgoaiLe loaiNgoaiLe;

    @Column(name = "gio_bat_dau")
    private LocalTime gioBatDau;

    @Column(name = "gio_ket_thuc")
    private LocalTime gioKetThuc;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    public enum LoaiNgoaiLe {
        NGHI,
        DOI_GIO
    }
}
