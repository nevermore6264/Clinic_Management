package com.clinic.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class TinNhanChatDto {
    private Long id;
    private Long maNguoiGui;
    private String tenNguoiGui;
    private String noiDung;
    private Long maPhong;
    private Instant taoLuc;
}
