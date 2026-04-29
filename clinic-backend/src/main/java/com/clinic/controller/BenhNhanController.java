package com.clinic.controller;

import com.clinic.dto.BenhNhanDto;
import com.clinic.service.BenhNhanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benh-nhan")
@RequiredArgsConstructor
public class BenhNhanController {

    private final BenhNhanService benhNhanService;

    @GetMapping
    public ResponseEntity<Page<BenhNhanDto>> danhSach(Pageable phanTrang) {
        return ResponseEntity.ok(benhNhanService.timTatCa(phanTrang));
    }

    @GetMapping("/tim-kiem")
    public ResponseEntity<List<BenhNhanDto>> timKiem(@RequestParam String ten) {
        return ResponseEntity.ok(benhNhanService.timTheoTen(ten));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BenhNhanDto> layTheoMa(@PathVariable Long id) {
        return ResponseEntity.ok(benhNhanService.layTheoMa(id));
    }

    @PostMapping
    public ResponseEntity<BenhNhanDto> tao(@Valid @RequestBody BenhNhanDto dto) {
        return ResponseEntity.ok(benhNhanService.tao(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BenhNhanDto> capNhat(@PathVariable Long id, @Valid @RequestBody BenhNhanDto dto) {
        return ResponseEntity.ok(benhNhanService.capNhat(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> voHieuHoa(@PathVariable Long id) {
        benhNhanService.voHieuHoa(id);
        return ResponseEntity.noContent().build();
    }
}
