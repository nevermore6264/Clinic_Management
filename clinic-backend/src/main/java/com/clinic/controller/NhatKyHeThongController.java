package com.clinic.controller;

import com.clinic.dto.NhatKyHeThongDto;
import com.clinic.service.NhatKyHeThongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/nhat-ky-he-thong")
@RequiredArgsConstructor
public class NhatKyHeThongController {

    private final NhatKyHeThongService nhatKyHeThongService;

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Page<NhatKyHeThongDto>> danhSach(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            Pageable phanTrang) {
        Instant batDau = tuNgay.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant ketThuc = denNgay.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        return ResponseEntity.ok(nhatKyHeThongService.timTheoKhoangThoiGian(batDau, ketThuc, phanTrang));
    }

    @GetMapping("/nguoi-dung/{maNguoiDung}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Page<NhatKyHeThongDto>> theoNguoiDung(@PathVariable Long maNguoiDung, Pageable phanTrang) {
        return ResponseEntity.ok(nhatKyHeThongService.timTheoMaNguoiDung(maNguoiDung, phanTrang));
    }

    @GetMapping("/thuc-the")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Page<NhatKyHeThongDto>> theoThucThe(
            @RequestParam String loaiThucThe,
            @RequestParam Long maThucThe,
            Pageable phanTrang) {
        return ResponseEntity.ok(nhatKyHeThongService.timTheoThucThe(loaiThucThe, maThucThe, phanTrang));
    }
}
