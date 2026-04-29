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
}
