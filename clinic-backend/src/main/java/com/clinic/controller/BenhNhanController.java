package com.clinic.controller;

import com.clinic.dto.BenhNhanDto;
import com.clinic.service.BenhNhanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benh-nhan")
@RequiredArgsConstructor
public class BenhNhanController {

    private final BenhNhanService benhNhanService;

    @GetMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BAC_SI','THU_NGAN')")
    public ResponseEntity<Page<BenhNhanDto>> danhSach(
            Pageable phanTrang,
            @RequestParam(required = false) String ten,
            @RequestParam(required = false, defaultValue = "hoat-dong") String trangThaiHoSo,
            @RequestParam(required = false) String gioiTinh,
            @RequestParam(required = false) String nhomMau) {
        Boolean hoatDongLoc = switch (trangThaiHoSo == null ? "hoat-dong" : trangThaiHoSo) {
            case "tat-ca" -> null;
            case "an" -> false;
            default -> true;
        };
        return ResponseEntity.ok(benhNhanService.timLoc(ten, hoatDongLoc, gioiTinh, nhomMau, phanTrang));
    }

    @GetMapping("/tim-kiem")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN','BAC_SI','THU_NGAN')")
    public ResponseEntity<List<BenhNhanDto>> timKiem(@RequestParam String ten) {
        return ResponseEntity.ok(benhNhanService.timTheoTen(ten));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BenhNhanDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(benhNhanService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<BenhNhanDto> tao(@Valid @RequestBody BenhNhanDto dto) {
        return ResponseEntity.ok(benhNhanService.tao(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BenhNhanDto> capNhat(@PathVariable Long id, @Valid @RequestBody BenhNhanDto dto) {
        return ResponseEntity.ok(benhNhanService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUAN_TRI','LE_TAN')")
    public ResponseEntity<Void> voHieuHoa(@PathVariable Long id) {
        benhNhanService.voHieuHoa(id);
        return ResponseEntity.noContent().build();
    }
}
