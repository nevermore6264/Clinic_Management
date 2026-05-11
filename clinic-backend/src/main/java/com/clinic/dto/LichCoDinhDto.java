package com.clinic.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class LichCoDinhDto {
    private Long id;
    private Long maBacSi;
    private String tenBacSi;
    private Integer thuTrongTuan;
    private LocalTime khungGioBatDau;
    private LocalTime khungGioKetThuc;
}
