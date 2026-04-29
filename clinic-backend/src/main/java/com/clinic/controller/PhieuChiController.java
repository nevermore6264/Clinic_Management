package com.clinic.controller;

import com.clinic.dto.PhieuChiDto;
import com.clinic.service.PhieuChiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/phieu-chi")
@RequiredArgsConstructor
public class PhieuChiController {

    private final PhieuChiService phieuChiService;

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','THU_NGAN')")
    public ResponseEntity<Page<PhieuChiDto>> danhSach(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            Pageable phanTrang) {
        return ResponseEntity.ok(phieuChiService.timTheoKhoang(tuNgay, denNgay, phanTrang));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','THU_NGAN')")
    public ResponseEntity<PhieuChiDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(phieuChiService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','THU_NGAN')")
    public ResponseEntity<PhieuChiDto> tao(@Valid @RequestBody PhieuChiDto dto) {
        return ResponseEntity.ok(phieuChiService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','THU_NGAN')")
    public ResponseEntity<PhieuChiDto> capNhat(@PathVariable Long id, @Valid @RequestBody PhieuChiDto dto) {
        return ResponseEntity.ok(phieuChiService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        phieuChiService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
