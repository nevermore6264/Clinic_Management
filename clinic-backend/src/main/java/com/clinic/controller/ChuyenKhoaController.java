package com.clinic.controller;

import com.clinic.dto.ChuyenKhoaDto;
import com.clinic.service.ChuyenKhoaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
