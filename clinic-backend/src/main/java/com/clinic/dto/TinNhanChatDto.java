package com.clinic.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class TinNhanChatDto {
    private Long id;
    private Long maNguoiGui;
    private String tenNguoiGui;
    /** Đối với tin nhắn riêng: người nhận. */
    private Long maNguoiNhan;
    private String tenNguoiNhan;
    private String noiDung;
    private Long maPhong;
    private Instant taoLuc;
}
