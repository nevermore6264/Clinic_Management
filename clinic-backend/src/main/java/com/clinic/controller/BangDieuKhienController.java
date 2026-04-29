package com.clinic.controller;

import com.clinic.dto.ThongKeBangDieuKhienDto;
import com.clinic.service.BangDieuKhienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bang-dieu-khien")
@RequiredArgsConstructor
public class BangDieuKhienController {

    private final BangDieuKhienService bangDieuKhienService;

    @GetMapping("/thong-ke")
    public ResponseEntity<ThongKeBangDieuKhienDto> thongKe() {
        return ResponseEntity.ok(bangDieuKhienService.layThongKe());
    }
}
