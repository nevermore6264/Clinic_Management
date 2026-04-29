package com.clinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "nguoi_dung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "ten_dang_nhap", unique = true, nullable = false)
    private String tenDangNhap;

    @NotBlank
    @Column(name = "mat_khau_bam", nullable = false)
    private String matKhauBam;

    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "vai_tro_nguoi_dung", joinColumns = @JoinColumn(name = "ma_nguoi_dung"))
    @Column(name = "vai_tro")
    @Builder.Default
    private Set<VaiTro> cacVaiTro = new HashSet<>();

    @Column(name = "ho_ten", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String hoTen;

    @Column(name = "thu_dien_tu", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String thuDienTu;

    @Column(name = "so_dien_thoai", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String soDienThoai;

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
