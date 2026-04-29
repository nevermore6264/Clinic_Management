package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "nhat_ky_he_thong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyHeThong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loai_thuc_the")
    private String loaiThucThe;

    @Column(name = "ma_thuc_the")
    private Long maThucThe;

    @Column(name = "hanh_dong")
    private String hanhDong;

    @Column(name = "gia_tri_cu")
    private String giaTriCu;

    @Column(name = "gia_tri_moi")
    private String giaTriMoi;

    @Column(name = "ma_nguoi_dung")
    private Long maNguoiDung;

    @Column(name = "ten_dang_nhap")
    private String tenDangNhap;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @PrePersist
    void luuTruoc() {
        if (taoLuc == null) taoLuc = Instant.now();
    }
}
