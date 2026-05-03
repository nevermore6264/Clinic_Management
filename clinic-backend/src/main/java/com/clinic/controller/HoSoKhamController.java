package com.clinic.controller;

import com.clinic.dto.HoSoKhamDto;
import com.clinic.service.HoSoKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ho-so-kham")
@RequiredArgsConstructor
public class HoSoKhamController {

    private final HoSoKhamService hoSoKhamService;

    @GetMapping("/benh-nhan/{maBenhNhan}")
    public ResponseEntity<List<HoSoKhamDto>> theoBenhNhan(@PathVariable Long maBenhNhan) {
        return ResponseEntity.ok(hoSoKhamService.timTheoBenhNhan(maBenhNhan));
    }

    /**
     * Chưa có hồ sơ khám cho lịch → JSON {@code null}, HTTP 200 (không dùng 404).
     */
    @GetMapping(value = "/lich-hen/{maLichHen}", produces = MediaType.APPLICATION_JSON_VALUE)
    public HoSoKhamDto theoLichHen(@PathVariable Long maLichHen) {
        return hoSoKhamService.layTheoMaLichHen(maLichHen);
    }

    @PostMapping("/lich-hen/{maLichHen}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BAC_SI','THU_NGAN')")
    public ResponseEntity<HoSoKhamDto> luu(@PathVariable Long maLichHen, @RequestBody HoSoKhamDto dto) {
        return ResponseEntity.ok(hoSoKhamService.luu(maLichHen, dto));
    }

    @PutMapping("/lich-hen/{maLichHen}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BAC_SI','THU_NGAN')")
    public ResponseEntity<HoSoKhamDto> capNhat(@PathVariable Long maLichHen, @RequestBody HoSoKhamDto dto) {
        return ResponseEntity.ok(hoSoKhamService.luu(maLichHen, dto));
    }
}
