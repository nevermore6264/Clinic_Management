package com.clinic.controller;

import com.clinic.dto.ChiTietHoaDonDto;
import com.clinic.dto.GiaoDichThanhToanDto;
import com.clinic.dto.HoaDonDto;
import com.clinic.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping
    public ResponseEntity<Page<HoaDonDto>> danhSach(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            Pageable phanTrang) {
        Instant batDau = tuNgay.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant ketThuc = denNgay.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        return ResponseEntity.ok(hoaDonService.timTrongKhoang(batDau, ketThuc, phanTrang));
    }

    @GetMapping("/benh-nhan/{maBenhNhan}")
    public ResponseEntity<List<HoaDonDto>> theoBenhNhan(@PathVariable Long maBenhNhan) {
        return ResponseEntity.ok(hoaDonService.timTheoBenhNhan(maBenhNhan));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDonDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(hoaDonService.layTheoMa(id));
    }

    @PostMapping
    public ResponseEntity<HoaDonDto> tao(
            @RequestParam Long maLichHen,
            @RequestBody List<ChiTietHoaDonDto> chiTiet) {
        return ResponseEntity.ok(hoaDonService.tao(maLichHen, chiTiet));
    }

    @PostMapping("/{maHoaDon}/thanh-toan")
    public ResponseEntity<GiaoDichThanhToanDto> themThanhToan(
            @PathVariable Long maHoaDon, @RequestBody GiaoDichThanhToanDto dto) {
        return ResponseEntity.ok(hoaDonService.themThanhToan(maHoaDon, dto));
    }
}
