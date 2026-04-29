package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cau_hinh_nhac_lich")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CauHinhNhacLich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "so_ngay_truoc", nullable = false)
    @Builder.Default
    private Integer soNgayTruoc = 1;

    @Column(name = "so_gio_truoc", nullable = false)
    @Builder.Default
    private Integer soGioTruoc = 2;

    @Column(name = "bat_thu_dien_tu")
    private boolean batThuDienTu = true;

    @Column(name = "bat_tin_nhan")
    private boolean batTinNhan = false;

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
