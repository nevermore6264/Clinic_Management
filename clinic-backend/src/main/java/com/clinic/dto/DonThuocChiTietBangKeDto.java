package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DonThuocChiTietBangKeDto {
    private Long maChiTiet;
    private Long maDonThuoc;
    private Long maHoSoKham;
    private Long maLichHen;
    private String tenBenhNhan;
    private LocalDate ngayHen;
    private LocalTime gioHen;
    private Long maThuoc;
    private String tenThuoc;
    private Integer soLuong;
    private String lieuDung;
    private BigDecimal donGia;
}
