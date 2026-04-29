package com.clinic.dto;

import com.clinic.entity.GiaoDichThanhToan;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class GiaoDichThanhToanDto {
    private Long id;
    private BigDecimal soTien;
    private GiaoDichThanhToan.PhuongThucThanhToan phuongThuc;
    private String maThamChieu;
    private Instant lucThanhToan;
}
