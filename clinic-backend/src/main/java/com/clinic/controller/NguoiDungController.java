package com.clinic.controller;

import com.clinic.dto.TaoNguoiDungYeuCau;
import com.clinic.dto.ThongTinNguoiDungDto;
import com.clinic.dto.CapNhatNguoiDungYeuCau;
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

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThongTinNguoiDungDto> capNhat(
            @PathVariable Long id,
            @Valid @RequestBody CapNhatNguoiDungYeuCau yeuCau) {
        return ResponseEntity.ok(nguoiDungService.capNhat(id, yeuCau));
    }

    @PatchMapping("/{id}/khoa")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> khoa(@PathVariable Long id) {
        nguoiDungService.khoaTaiKhoan(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/mo-khoa")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> moKhoa(@PathVariable Long id) {
        nguoiDungService.moKhoaTaiKhoan(id);
        return ResponseEntity.noContent().build();
    }
}
