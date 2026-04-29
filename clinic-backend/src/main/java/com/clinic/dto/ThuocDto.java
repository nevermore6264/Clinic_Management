package com.clinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ThuocDto {
    private Long id;
    @NotBlank
    private String tenThuoc;
    private String donVi;
    private String hoatChat;
    private String hamLuong;
    private String dangBaoChe;
    private String duongDung;
    private String hangSanXuat;
    private String nuocSanXuat;
    private String soDangKy;
    private String soLo;
    private LocalDate hanSuDung;
    private BigDecimal giaNhap;
    private BigDecimal giaBan;
    private Integer tonKho;
    private Integer mucTonToiThieu;
    private String chiDinh;
    private String chongChiDinh;
    private String tacDungPhu;
    private boolean hoatDong;
}
