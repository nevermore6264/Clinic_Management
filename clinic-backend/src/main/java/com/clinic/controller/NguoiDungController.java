package com.clinic.controller;

import com.clinic.dto.TaoNguoiDungYeuCau;
import com.clinic.dto.ThongTinNguoiDungDto;
import com.clinic.service.NguoiDungService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<ThongTinNguoiDungDto>> danhSach() {
        return ResponseEntity.ok(nguoiDungService.timTatCa());
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThongTinNguoiDungDto> tao(@Valid @RequestBody TaoNguoiDungYeuCau yeuCau) {
        return ResponseEntity.ok(nguoiDungService.tao(yeuCau));
    }
}
