package com.clinic.controller;

import com.clinic.dto.HoSoKhamDto;
import com.clinic.service.HoSoKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/lich-hen/{maLichHen}")
    public ResponseEntity<HoSoKhamDto> theoLichHen(@PathVariable Long maLichHen) {
        HoSoKhamDto dto = hoSoKhamService.layTheoMaLichHen(maLichHen);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/lich-hen/{maLichHen}")
    public ResponseEntity<HoSoKhamDto> luu(@PathVariable Long maLichHen, @RequestBody HoSoKhamDto dto) {
        return ResponseEntity.ok(hoSoKhamService.luu(maLichHen, dto));
    }

    @PutMapping("/lich-hen/{maLichHen}")
    public ResponseEntity<HoSoKhamDto> capNhat(@PathVariable Long maLichHen, @RequestBody HoSoKhamDto dto) {
        return ResponseEntity.ok(hoSoKhamService.luu(maLichHen, dto));
    }
}
