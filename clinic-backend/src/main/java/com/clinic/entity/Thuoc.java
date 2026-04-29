package com.clinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;


@Entity
@Table(name = "thuoc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Thuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "ten_thuoc", nullable = false)
    private String tenThuoc;

    @Column(name = "don_vi", length = 50)
    private String donVi;

    @Column(name = "hoat_chat", length = 500)
    private String hoatChat;

    @Column(name = "ham_luong", length = 100)
    private String hamLuong;

    @Column(name = "dang_bao_che", length = 100)
    private String dangBaoChe;

    @Column(name = "duong_dung", length = 100)
    private String duongDung;

    @Column(name = "hang_san_xuat", length = 255)
    private String hangSanXuat;

    @Column(name = "nuoc_san_xuat", length = 100)
    private String nuocSanXuat;

    @Column(name = "so_dang_ky", length = 100)
    private String soDangKy;

    @Column(name = "so_lo", length = 100)
    private String soLo;

    @Column(name = "han_su_dung")
    private LocalDate hanSuDung;

    @Column(name = "gia_nhap", precision = 15, scale = 2)
    private BigDecimal giaNhap;

    @Column(name = "gia_ban", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "ton_kho")
    private Integer tonKho;

    @Column(name = "muc_ton_toi_thieu")
    private Integer mucTonToiThieu;

    @Column(name = "chi_dinh", length = 1000)
    private String chiDinh;

    @Column(name = "chong_chi_dinh", length = 1000)
    private String chongChiDinh;

    @Column(name = "tac_dung_phu", length = 1000)
    private String tacDungPhu;

    @Column(name = "hoat_dong")
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
