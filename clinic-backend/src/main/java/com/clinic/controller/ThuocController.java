package com.clinic.controller;

import com.clinic.dto.ThuocDto;
import com.clinic.service.ThuocService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thuoc")
@RequiredArgsConstructor
public class ThuocController {

    private final ThuocService thuocService;

    
    @GetMapping("/dang-hoat-dong")
    public ResponseEntity<List<ThuocDto>> dangHoatDong() {
        return ResponseEntity.ok(thuocService.danhSachDangHoatDong());
    }

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<ThuocDto>> tatCa() {
        return ResponseEntity.ok(thuocService.danhSachTatCa());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThuocDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(thuocService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThuocDto> tao(@Valid @RequestBody ThuocDto dto) {
        return ResponseEntity.ok(thuocService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThuocDto> capNhat(@PathVariable Long id, @Valid @RequestBody ThuocDto dto) {
        return ResponseEntity.ok(thuocService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        thuocService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
