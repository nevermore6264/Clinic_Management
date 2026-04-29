package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;

@Entity
@Table(name = "lich_lam_viec_bac_si", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ma_bac_si", "ngay_lich", "khung_gio_bat_dau"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichLamViecBacSi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bac_si", nullable = false)
    private BacSi bacSi;

    @Column(name = "ngay_lich", nullable = false)
    private LocalDate ngayLich;

    @Column(name = "khung_gio_bat_dau", nullable = false)
    private LocalTime khungGioBatDau;

    @Column(name = "khung_gio_ket_thuc", nullable = false)
    private LocalTime khungGioKetThuc;

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
}
