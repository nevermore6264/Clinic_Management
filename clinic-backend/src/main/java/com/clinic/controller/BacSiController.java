package com.clinic.controller;

import com.clinic.dto.BacSiDto;
import com.clinic.service.BacSiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bac-si")
@RequiredArgsConstructor
public class BacSiController {

    private final BacSiService bacSiService;

    @GetMapping
    public ResponseEntity<List<BacSiDto>> danhSach() {
        return ResponseEntity.ok(bacSiService.timTatCaDangHoatDong());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacSiDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(bacSiService.layTheoMa(id));
    }
}
