package com.clinic.dto;

import lombok.Data;

import java.util.List;

@Data
public class BacSiSlotKhaDungDto {
    private Long maBacSi;
    private String tenBacSi;
    private Long maChuyenKhoa;
    private String tenChuyenKhoa;
    private List<SlotKhaDungDto> slots;
}
