package com.clinic.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class KetQuaGuiNhacHangLoatDto {
    private int thanhCong;
    private int thatBai;
    private List<LoiGuiNhacDto> loi = new ArrayList<>();

    @Data
    public static class LoiGuiNhacDto {
        private Long maLichHen;
        private String lyDo;
    }
}
