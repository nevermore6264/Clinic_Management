package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ho_so_kham")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoSoKham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_lich_hen", nullable = false, unique = true)
    private LichHen lichHen;

    @Column(name = "chan_doan", columnDefinition = "TEXT")
    private String chanDoan;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "nhiet_do")
    private Double nhietDo;

    @Column(name = "huyet_ap_tam_thu")
    private Integer huyetApTamThu;

    @Column(name = "huyet_ap_tam_truong")
    private Integer huyetApTamTruong;

    @Column(name = "nhip_tim")
    private Integer nhipTim;

    @Column(name = "nhip_tho")
    private Integer nhipTho;

    @Column(name = "chieu_cao_cm")
    private Double chieuCaoCm;

    @Column(name = "can_nang_kg")
    private Double canNangKg;

    @Column(name = "spo2")
    private Integer spo2;

    @Column(name = "ghi_chu_sinh_hieu", columnDefinition = "TEXT")
    private String ghiChuSinhHieu;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @Column(name = "cap_nhat_luc")
    private Instant capNhatLuc;

    @OneToOne(mappedBy = "hoSoKham", cascade = CascadeType.ALL, orphanRemoval = true)
    private DonThuoc donThuoc;

    @OneToMany(mappedBy = "hoSoKham", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietDichVuKham> chiTietDichVuKham = new ArrayList<>();

    @PrePersist
    void luuTruoc() {
        taoLuc = capNhatLuc = Instant.now();
    }

    @PreUpdate
    void capNhatSau() {
        capNhatLuc = Instant.now();
    }
}
