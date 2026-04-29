package com.clinic.controller;

import com.clinic.dto.DichVuDto;
import com.clinic.service.XuLyDichVuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dich-vu")
@RequiredArgsConstructor
public class DichVuController {

    private final XuLyDichVuService xuLyDichVuService;

    @GetMapping
    public ResponseEntity<List<DichVuDto>> danhSach() {
        return ResponseEntity.ok(xuLyDichVuService.timTatCaDangHoatDong());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DichVuDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(xuLyDichVuService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<DichVuDto> tao(@Valid @RequestBody DichVuDto dto) {
        return ResponseEntity.ok(xuLyDichVuService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<DichVuDto> capNhat(@PathVariable Long id, @Valid @RequestBody DichVuDto dto) {
        return ResponseEntity.ok(xuLyDichVuService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> voHieuHoa(@PathVariable Long id) {
        xuLyDichVuService.voHieuHoa(id);
        return ResponseEntity.noContent().build();
    }
}
