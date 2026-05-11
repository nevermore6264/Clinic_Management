package com.clinic.controller;

import com.clinic.dto.LichCoDinhDto;
import com.clinic.dto.LichLamViecBacSiDto;
import com.clinic.service.LichLamViecBacSiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lich-lam-viec-bac-si")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BAC_SI','THU_NGAN')")
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
    public ResponseEntity<Void> xoa(
            @PathVariable Long id,
            @RequestParam(required = false) String nguon) {
        lichLamViecBacSiService.xoa(id, nguon);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/co-dinh/bac-si/{maBacSi}")
    public ResponseEntity<List<LichCoDinhDto>> coDinhTheoBacSi(@PathVariable Long maBacSi) {
        return ResponseEntity.ok(lichLamViecBacSiService.layCoDinhTheoBacSi(maBacSi));
    }

    @PostMapping("/co-dinh")
    @PreAuthorize("hasAnyRole('QUAN_TRI','BAC_SI')")
    public ResponseEntity<LichCoDinhDto> taoCoDinh(@RequestBody LichCoDinhDto dto) {
        return ResponseEntity.ok(lichLamViecBacSiService.taoCoDinh(dto));
    }

    @PutMapping("/co-dinh/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','BAC_SI')")
    public ResponseEntity<LichCoDinhDto> capNhatCoDinh(@PathVariable Long id, @RequestBody LichCoDinhDto dto) {
        return ResponseEntity.ok(lichLamViecBacSiService.capNhatCoDinh(id, dto));
    }

    @DeleteMapping("/co-dinh/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','BAC_SI')")
    public ResponseEntity<Void> xoaCoDinh(@PathVariable Long id) {
        lichLamViecBacSiService.xoaCoDinh(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/co-dinh/gieo-mac-dinh/{maBacSi}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','BAC_SI')")
    public ResponseEntity<List<LichCoDinhDto>> gieoMacDinhBacSi(
            @PathVariable Long maBacSi,
            @RequestParam(defaultValue = "true") boolean ghiDe) {
        return ResponseEntity.ok(lichLamViecBacSiService.gieoMacDinhChoBacSi(maBacSi, ghiDe));
    }

    @PostMapping("/co-dinh/gieo-mac-dinh-tat-ca")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Map<String, Object>> gieoMacDinhTatCa(
            @RequestParam(defaultValue = "false") boolean ghiDe) {
        int soBacSi = lichLamViecBacSiService.gieoMacDinhChoTatCaBacSi(ghiDe);
        return ResponseEntity.ok(Map.of("soBacSiDaXuLy", soBacSi, "ghiDe", ghiDe));
    }
}
