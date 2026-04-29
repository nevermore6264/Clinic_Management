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

    @Column(name = "don_thuoc", columnDefinition = "TEXT")
    private String donThuoc;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @Column(name = "cap_nhat_luc")
    private Instant capNhatLuc;

    @OneToMany(mappedBy = "hoSoKham", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietDonThuoc> chiTietDonThuoc = new ArrayList<>();

    @PrePersist
    void luuTruoc() {
        taoLuc = capNhatLuc = Instant.now();
    }

    @PreUpdate
    void capNhatSau() {
        capNhatLuc = Instant.now();
    }
}
