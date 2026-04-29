package com.clinic.dto;

import com.clinic.entity.LichHen;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class LichHenDto {
    private Long id;
    private Long maBenhNhan;
    private String tenBenhNhan;
    private Long maBacSi;
    private String tenBacSi;
    private Long maDichVu;
    private String tenDichVu;
    private LocalDate ngayHen;
    private LocalTime gioHen;
    private LichHen.TrangThaiLichHen trangThai;
    private String ghiChu;
}
