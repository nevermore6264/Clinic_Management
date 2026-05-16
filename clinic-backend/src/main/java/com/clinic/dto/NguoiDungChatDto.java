package com.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDungChatDto {
    private Long id;
    private String hoTen;
    private String tenDangNhap;
    private Set<String> cacVaiTro = new LinkedHashSet<>();
}
