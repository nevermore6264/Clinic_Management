package com.clinic.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class LichLamViecBacSiDto {
    private Long id;
    private Long maBacSi;
    private String tenBacSi;
    private LocalDate ngayLich;
    private LocalTime khungGioBatDau;
    private LocalTime khungGioKetThuc;
    /** NGOAI_LE | CO_DINH | LICH_BAC_SI_THU_VIEN — phân biệt nguồn khi đọc/ghi/xóa. */
    private String nguonBanGhi;
    /** Khi true, tạo ngoại lệ nghỉ cả ngày (không cần khung giờ). */
    private Boolean nghiCaNgay;
}
