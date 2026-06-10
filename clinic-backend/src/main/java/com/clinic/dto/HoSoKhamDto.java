package com.clinic.dto;

import lombok.Data;

import java.util.List;

@Data
public class HoSoKhamDto {
    private Long id;
    private Long maLichHen;
    private String chanDoan;
    private String donThuoc;
    private String ghiChu;

    private Double nhietDo;
    private Integer huyetApTamThu;
    private Integer huyetApTamTruong;
    private Integer nhipTim;
    private Integer nhipTho;
    private Double chieuCaoCm;
    private Double canNangKg;
    private Integer spo2;
    private String ghiChuSinhHieu;

    private List<ChiTietDonThuocDto> chiTietDonThuoc;
    private List<ChiTietDichVuKhamDto> chiTietDichVu;
}
