package com.clinic.controller;

import com.clinic.dto.DangKyBenhNhanYeuCau;
import com.clinic.dto.DatLaiMatKhauYeuCau;
import com.clinic.dto.DoiMatKhauYeuCau;
import com.clinic.dto.DangNhapYeuCau;
import com.clinic.dto.DangNhapPhanHoi;
import com.clinic.dto.QuenMatKhauYeuCau;
import com.clinic.service.KhoiPhucMatKhauService;
import com.clinic.service.XacThucService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/xac-thuc")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService xacThucService;
    private final KhoiPhucMatKhauService khoiPhucMatKhauService;

    @PostMapping("/dang-nhap")
    public ResponseEntity<DangNhapPhanHoi> dangNhap(@Valid @RequestBody DangNhapYeuCau yeuCau) {
        return ResponseEntity.ok(xacThucService.dangNhap(yeuCau));
    }

    @PostMapping("/dang-ky-benh-nhan")
    public ResponseEntity<DangNhapPhanHoi> dangKyBenhNhan(@Valid @RequestBody DangKyBenhNhanYeuCau yeuCau) {
        return ResponseEntity.ok(xacThucService.dangKyBenhNhan(yeuCau));
    }

    @PutMapping("/doi-mat-khau")
    public ResponseEntity<Void> doiMatKhau(@Valid @RequestBody DoiMatKhauYeuCau yeuCau) {
        xacThucService.doiMatKhau(yeuCau);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quen-mat-khau")
    public ResponseEntity<Map<String, String>> quenMatKhau(@Valid @RequestBody QuenMatKhauYeuCau yeuCau) {
        khoiPhucMatKhauService.yeuCauKhoiPhuc(yeuCau);
        return ResponseEntity.ok(Map.of(
                "thongBao",
                "Nếu tài khoản tồn tại và có email, hệ thống đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư."));
    }

    @GetMapping("/kiem-tra-ma-khoi-phuc")
    public ResponseEntity<Map<String, Boolean>> kiemTraMaKhoiPhuc(@RequestParam String token) {
        return ResponseEntity.ok(Map.of("hopLe", khoiPhucMatKhauService.tokenConHieuLuc(token)));
    }

    @PostMapping("/dat-lai-mat-khau")
    public ResponseEntity<Void> datLaiMatKhau(@Valid @RequestBody DatLaiMatKhauYeuCau yeuCau) {
        khoiPhucMatKhauService.datLaiMatKhau(yeuCau);
        return ResponseEntity.noContent().build();
    }
}
