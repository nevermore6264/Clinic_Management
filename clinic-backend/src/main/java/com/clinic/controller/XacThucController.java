package com.clinic.controller;

import com.clinic.dto.DoiMatKhauYeuCau;
import com.clinic.dto.DangNhapYeuCau;
import com.clinic.dto.DangNhapPhanHoi;
import com.clinic.service.XacThucService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/xac-thuc")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService xacThucService;

    @PostMapping("/dang-nhap")
    public ResponseEntity<DangNhapPhanHoi> dangNhap(@Valid @RequestBody DangNhapYeuCau yeuCau) {
        return ResponseEntity.ok(xacThucService.dangNhap(yeuCau));
    }

    @PutMapping("/doi-mat-khau")
    public ResponseEntity<Void> doiMatKhau(@Valid @RequestBody DoiMatKhauYeuCau yeuCau) {
        xacThucService.doiMatKhau(yeuCau);
        return ResponseEntity.noContent().build();
    }
}
