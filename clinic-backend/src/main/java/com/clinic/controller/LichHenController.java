package com.clinic.controller;

import com.clinic.dto.LichHenDto;
import com.clinic.dto.LichSuTrangThaiLichHenDto;
import com.clinic.entity.LichHen;
import com.clinic.service.LichHenService;
import com.clinic.service.LichSuTrangThaiLichHenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lich-hen")
@RequiredArgsConstructor
public class LichHenController {

    private final LichHenService lichHenService;
    private final LichSuTrangThaiLichHenService lichSuTrangThaiLichHenService;

    @GetMapping
    public ResponseEntity<Page<LichHenDto>> danhSach(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            Pageable phanTrang) {
        return ResponseEntity.ok(lichHenService.timTrongKhoang(tuNgay, denNgay, phanTrang));
    }

    @GetMapping("/benh-nhan/{maBenhNhan}")
    public ResponseEntity<List<LichHenDto>> theoBenhNhan(@PathVariable Long maBenhNhan) {
        return ResponseEntity.ok(lichHenService.timTheoBenhNhan(maBenhNhan));
    }

    @GetMapping("/bac-si/{maBacSi}")
    public ResponseEntity<List<LichHenDto>> theoBacSiVaNgay(
            @PathVariable Long maBacSi,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay) {
        return ResponseEntity.ok(lichHenService.timTheoBacSiVaNgay(maBacSi, ngay));
    }

    @GetMapping("/{id}/lich-su-trang-thai")
    public ResponseEntity<List<LichSuTrangThaiLichHenDto>> lichSuTrangThai(@PathVariable Long id) {
        return ResponseEntity.ok(lichSuTrangThaiLichHenService.layTheoMaLichHen(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LichHenDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(lichHenService.layTheoMa(id));
    }

    @PostMapping
    public ResponseEntity<LichHenDto> tao(@Valid @RequestBody LichHenDto dto) {
        return ResponseEntity.ok(lichHenService.tao(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichHenDto> capNhat(@PathVariable Long id, @Valid @RequestBody LichHenDto dto) {
        return ResponseEntity.ok(lichHenService.capNhat(id, dto));
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<LichHenDto> capNhatTrangThai(
            @PathVariable Long id, @RequestParam LichHen.TrangThaiLichHen trangThai) {
        return ResponseEntity.ok(lichHenService.capNhatTrangThai(id, trangThai));
    }
}
