package com.clinic.controller;

import com.clinic.dto.DonThuocChiTietBangKeDto;
import com.clinic.dto.ThuocDto;
import com.clinic.service.ThuocService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/thuoc")
@RequiredArgsConstructor
public class ThuocController {

    private static final Set<String> THUOC_SORT_FIELDS = Set.of(
            "tenThuoc", "giaBan", "giaNhap", "hanSuDung", "tonKho", "id");

    private final ThuocService thuocService;

    
    @GetMapping("/dang-hoat-dong")
    public ResponseEntity<List<ThuocDto>> dangHoatDong() {
        return ResponseEntity.ok(thuocService.danhSachDangHoatDong());
    }

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<ThuocDto>> tatCa() {
        return ResponseEntity.ok(thuocService.danhSachTatCa());
    }

    @GetMapping("/bang-ke-don-thuoc")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<List<DonThuocChiTietBangKeDto>> bangKeDonThuoc() {
        return ResponseEntity.ok(thuocService.bangKeDonThuocChiTiet());
    }

    @GetMapping("/tim-kiem")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Page<ThuocDto>> timKiem(
            @RequestParam(required = false) String tuKhoa,
            @RequestParam(required = false, defaultValue = "tat-ca") String trangThai,
            @RequestParam(required = false) String donVi,
            @RequestParam(required = false) String dangBaoChe,
            @RequestParam(required = false) String duongDung,
            @RequestParam(required = false) String hangSanXuat,
            @RequestParam(required = false) String nuocSanXuat,
            @RequestParam(required = false, defaultValue = "false") boolean tonThap,
            @RequestParam(required = false) String hanTu,
            @RequestParam(required = false) String hanDen,
            @RequestParam(required = false) String giaBanTu,
            @RequestParam(required = false) String giaBanDen,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "tenThuoc,asc") String sort) {
        LocalDate ht = parseLocalDate(hanTu);
        LocalDate hd = parseLocalDate(hanDen);
        BigDecimal gt = parseBigDecimal(giaBanTu);
        BigDecimal gd = parseBigDecimal(giaBanDen);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        Pageable pg = PageRequest.of(safePage, safeSize, parseSortThuoc(sort));
        return ResponseEntity.ok(thuocService.timKiem(
                tuKhoa,
                trangThai,
                donVi,
                dangBaoChe,
                duongDung,
                hangSanXuat,
                nuocSanXuat,
                tonThap,
                ht,
                hd,
                gt,
                gd,
                pg));
    }

    private static LocalDate parseLocalDate(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(s.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private static BigDecimal parseBigDecimal(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(s.trim().replace(" ", "").replace(",", "."));
        } catch (Exception e) {
            return null;
        }
    }

    private static Sort parseSortThuoc(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "tenThuoc");
        }
        String[] p = sort.split(",");
        String field = p[0].trim();
        if (!THUOC_SORT_FIELDS.contains(field)) {
            field = "tenThuoc";
        }
        Sort.Direction dir = p.length > 1 && "desc".equalsIgnoreCase(p[1].trim())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(dir, field);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThuocDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(thuocService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThuocDto> tao(@Valid @RequestBody ThuocDto dto) {
        return ResponseEntity.ok(thuocService.tao(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<ThuocDto> capNhat(@PathVariable Long id, @Valid @RequestBody ThuocDto dto) {
        return ResponseEntity.ok(thuocService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        thuocService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
