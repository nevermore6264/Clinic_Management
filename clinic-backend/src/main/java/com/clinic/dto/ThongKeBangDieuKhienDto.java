package com.clinic.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ThongKeBangDieuKhienDto {
    private long tongBenhNhan;
    private long lichHenHomNay;
    private long lichHenTuanNay;
    private BigDecimal doanhThuHomNay;
    private BigDecimal doanhThuTuanNay;
    private BigDecimal tongChiHomNay;
    private BigDecimal tongChiTuanNay;
    private List<BaoCaoDoanhThuDto> doanhThu7NgayGanNhat;

    private long lichHenChoTiepNhanHomNay;
    private long lichHenTrongKhamHomNay;
    private long lichHenSauKhamHomNay;
    private long lichHenDaHoanTatHomNay;
    private long lichHenHuyVangHomNay;
    private long soBacSiCoLichHomNay;
}
