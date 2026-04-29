package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Lịch sử chuyển trạng thái lịch hẹn — truy vết quy trình khám (nghiệp vụ cốt lõi, thay thế ý nghĩa “nhật ký chung” cho luồng lịch).
 */
@Entity
@Table(name = "lich_su_trang_thai_lich_hen", indexes = {
        @Index(name = "idx_ls_ma_lich", columnList = "ma_lich_hen"),
        @Index(name = "idx_ls_tao_luc", columnList = "tao_luc")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuTrangThaiLichHen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_lich_hen", nullable = false)
    private LichHen lichHen;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai_cu")
    private LichHen.TrangThaiLichHen trangThaiCu;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai_moi", nullable = false)
    private LichHen.TrangThaiLichHen trangThaiMoi;

    @Column(name = "ma_nguoi_dung")
    private Long maNguoiDung;

    @Column(name = "ten_dang_nhap")
    private String tenDangNhap;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "tao_luc")
    private Instant taoLuc;

    @PrePersist
    void luuTruoc() {
        if (taoLuc == null) taoLuc = Instant.now();
    }
}
