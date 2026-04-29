package com.clinic.dto;

import com.clinic.entity.HoaDon;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
public class HoaDonDto {
    private Long id;
    private Long maLichHen;
    private Long maBenhNhan;
    private String tenBenhNhan;
    private BigDecimal tongTien;
    private BigDecimal soTienDaTra;
    private HoaDon.TrangThaiHoaDon trangThai;
    private String soHoaDon;
    private Instant taoLuc;
    private List<ChiTietHoaDonDto> chiTiet = new ArrayList<>();
    private List<GiaoDichThanhToanDto> giaoDichThanhToan = new ArrayList<>();
}
