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
    
    private List<ChiTietDonThuocDto> chiTietDonThuoc;
}
