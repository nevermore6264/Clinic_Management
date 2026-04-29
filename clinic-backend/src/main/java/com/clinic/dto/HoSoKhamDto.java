package com.clinic.dto;

import lombok.Data;

import java.util.List;

@Data
public class HoSoKhamDto {
    private Long id;
    private Long maLichHen;
    private String chanDoan;
    private String donThuoc;
    private String ghiChu;
    /** Dòng đơn thuốc có cấu trúc (danh mục thuốc). */
    private List<ChiTietDonThuocDto> chiTietDonThuoc;
}
