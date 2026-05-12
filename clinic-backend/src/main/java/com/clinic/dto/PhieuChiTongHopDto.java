package com.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuChiTongHopDto {
    private long soPhieu;
    private BigDecimal tongTien;
    @Builder.Default
    private Map<String, BigDecimal> tienTheoLoai = new LinkedHashMap<>();
}
