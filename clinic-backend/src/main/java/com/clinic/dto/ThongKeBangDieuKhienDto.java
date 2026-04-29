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
    private List<BaoCaoDoanhThuDto> doanhThu7NgayGanNhat;
}
