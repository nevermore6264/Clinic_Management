package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "bac_si")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BacSi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ma_nguoi_dung", unique = true)
    private NguoiDung nguoiDung;

    /** Họ tên khi chưa gắn tài khoản đăng nhập (khi {@link #nguoiDung} null). */
    @Column(name = "ho_ten")
    private String hoTen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_chuyen_khoa")
    private ChuyenKhoa chuyenKhoa;

    @Column(name = "bang_cap")
    private String bangCap;

    @Column(name = "hoat_dong", nullable = false)
    @Builder.Default
    private boolean hoatDong = true;

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
