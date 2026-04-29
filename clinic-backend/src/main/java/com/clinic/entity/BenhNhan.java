package com.clinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "benh_nhan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BenhNhan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "thu_dien_tu")
    private String thuDienTu;

    @Column(name = "hoat_dong", nullable = false)
    @Builder.Default
    private boolean hoatDong = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nguoi_dung", unique = true)
    private NguoiDung nguoiDung;

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
