package com.clinic.controller;

import com.clinic.dto.LoaiDichVuDto;
import com.clinic.service.LoaiDichVuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loai-dich-vu")
@RequiredArgsConstructor
public class LoaiDichVuController {

    private final LoaiDichVuService loaiDichVuService;

    @GetMapping
    public ResponseEntity<List<LoaiDichVuDto>> danhSach() {
        return ResponseEntity.ok(loaiDichVuService.danhSach());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoaiDichVuDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(loaiDichVuService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<LoaiDichVuDto> tao(@Valid @RequestBody LoaiDichVuDto dto) {
        return ResponseEntity.ok(loaiDichVuService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<LoaiDichVuDto> capNhat(@PathVariable Long id, @Valid @RequestBody LoaiDichVuDto dto) {
        return ResponseEntity.ok(loaiDichVuService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        loaiDichVuService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
