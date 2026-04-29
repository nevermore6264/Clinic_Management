package com.clinic.controller;

import com.clinic.dto.BaoCaoDoanhThuDto;
import com.clinic.service.BaoCaoService;
import com.clinic.service.XuatBaoCaoExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bao-cao")
@RequiredArgsConstructor
public class BaoCaoController {

    private final BaoCaoService baoCaoService;
    private final XuatBaoCaoExcelService xuatBaoCaoExcelService;

    @GetMapping("/doanh-thu")
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('THU_NGAN')")
    public ResponseEntity<List<BaoCaoDoanhThuDto>> doanhThu(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false) Long maBacSi,
            @RequestParam(required = false) Long maDichVu) {
        return ResponseEntity.ok(baoCaoService.doanhThuTheoNgay(tuNgay, denNgay, maBacSi, maDichVu));
    }

    @GetMapping(value = "/doanh-thu/xuat-excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('THU_NGAN')")
    public ResponseEntity<byte[]> xuatExcelDoanhThu(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false) Long maBacSi,
            @RequestParam(required = false) Long maDichVu) {
        byte[] bytes = xuatBaoCaoExcelService.xuatExcelDoanhThu(tuNgay, denNgay, maBacSi, maDichVu);
        String tenTep = "bao-cao-doanh-thu-" + tuNgay + "-" + denNgay + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + tenTep + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
