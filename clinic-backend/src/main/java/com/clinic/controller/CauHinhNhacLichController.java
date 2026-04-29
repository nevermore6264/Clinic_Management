package com.clinic.controller;

import com.clinic.dto.CauHinhNhacLichDto;
import com.clinic.service.NhacLichHenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cau-hinh-nhac-lich")
@RequiredArgsConstructor
public class CauHinhNhacLichController {

    private final NhacLichHenService nhacLichHenService;

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('LE_TAN')")
    public ResponseEntity<CauHinhNhacLichDto> lay() {
        return ResponseEntity.ok(nhacLichHenService.layCauHinh());
    }

    @PutMapping
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('LE_TAN')")
    public ResponseEntity<CauHinhNhacLichDto> capNhat(@RequestBody CauHinhNhacLichDto dto) {
        return ResponseEntity.ok(nhacLichHenService.luuCauHinh(dto));
    }
}
