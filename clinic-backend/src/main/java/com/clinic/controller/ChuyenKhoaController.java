package com.clinic.controller;

import com.clinic.dto.CapNhatChuyenKhoaYeuCau;
import com.clinic.dto.ChuyenKhoaDto;
import com.clinic.dto.TaoChuyenKhoaYeuCau;
import com.clinic.service.ChuyenKhoaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chuyen-khoa")
@RequiredArgsConstructor
public class ChuyenKhoaController {

    private final ChuyenKhoaService chuyenKhoaService;

    @GetMapping
    public ResponseEntity<List<ChuyenKhoaDto>> danhSach() {
        return ResponseEntity.ok(chuyenKhoaService.timTatCa());
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ChuyenKhoaDto> tao(@Valid @RequestBody TaoChuyenKhoaYeuCau yeuCau) {
        return ResponseEntity.ok(chuyenKhoaService.tao(yeuCau));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ChuyenKhoaDto> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody CapNhatChuyenKhoaYeuCau yeuCau) {
        return ResponseEntity.ok(chuyenKhoaService.capNhat(id, yeuCau));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        chuyenKhoaService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
