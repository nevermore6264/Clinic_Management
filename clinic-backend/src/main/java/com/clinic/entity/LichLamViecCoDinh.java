package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalTime;

@Entity
@Table(name = "lich_lam_viec_co_dinh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichLamViecCoDinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_lich_co_dinh")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bac_si", nullable = false)
    private BacSi bacSi;

    @Column(name = "thu_trong_tuan")
    private Integer thuTrongTuan;

    @Column(name = "khung_gio_bat_dau")
    private LocalTime khungGioBatDau;

    @Column(name = "khung_gio_ket_thuc")
    private LocalTime khungGioKetThuc;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @Column(name = "cap_nhat_luc")
    private Instant capNhatLuc;
}
