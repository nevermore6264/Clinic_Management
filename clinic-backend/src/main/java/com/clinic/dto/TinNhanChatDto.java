package com.clinic.dto;

import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
public class TinNhanChatDto {
    private Long id;
    private Long maNguoiGui;
    private String tenNguoiGui;
    private Long maNguoiNhan;
    private String tenNguoiNhan;
    private String noiDung;
    private String dinhKemDuongDan;
    private String dinhKemTen;
    private String dinhKemLoai;
    private Long maPhong;
    private Instant taoLuc;
    private Map<String, String> phanUng;
}
