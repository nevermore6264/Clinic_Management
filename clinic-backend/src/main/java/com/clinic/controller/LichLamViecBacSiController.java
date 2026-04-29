package com.clinic.controller;

import com.clinic.dto.LichLamViecBacSiDto;
import com.clinic.service.LichLamViecBacSiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lich-lam-viec-bac-si")
@RequiredArgsConstructor
public class LichLamViecBacSiController {

    private final LichLamViecBacSiService lichLamViecBacSiService;

    @GetMapping("/bac-si/{maBacSi}")
    public ResponseEntity<List<LichLamViecBacSiDto>> theoBacSiVaNgay(
            @PathVariable Long maBacSi,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay) {
        return ResponseEntity.ok(lichLamViecBacSiService.timTheoBacSiVaNgay(maBacSi, ngay));
    }

    @GetMapping("/bac-si/{maBacSi}/khoang-ngay")
    public ResponseEntity<List<LichLamViecBacSiDto>> theoBacSiVaKhoangNgay(
            @PathVariable Long maBacSi,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        return ResponseEntity.ok(lichLamViecBacSiService.timTheoBacSiVaKhoangNgay(maBacSi, tuNgay, denNgay));
    }

    @PostMapping
    public ResponseEntity<LichLamViecBacSiDto> tao(@RequestBody LichLamViecBacSiDto dto) {
        return ResponseEntity.ok(lichLamViecBacSiService.tao(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichLamViecBacSiDto> capNhat(@PathVariable Long id, @RequestBody LichLamViecBacSiDto dto) {
        return ResponseEntity.ok(lichLamViecBacSiService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        lichLamViecBacSiService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
