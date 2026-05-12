package com.clinic.controller;

import com.clinic.dto.BacSiDto;
import com.clinic.dto.CapNhatBacSiYeuCau;
import com.clinic.dto.TaoBacSiYeuCau;
import com.clinic.service.BacSiService;
import com.clinic.security.QuyenTruyCapLichLamViecBacSi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bac-si")
@RequiredArgsConstructor
public class BacSiController {

    private final BacSiService bacSiService;
    private final QuyenTruyCapLichLamViecBacSi quyenTruyCapLichLamViecBacSi;

    @GetMapping
    public ResponseEntity<List<BacSiDto>> danhSach(
            @RequestParam(required = false, defaultValue = "false") boolean tatCa,
            Authentication authentication) {
        if (tatCa) {
            boolean quanTri = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch("ROLE_QUAN_TRI"::equals);
            if (!quanTri) {
                throw new AccessDeniedException("Chỉ quản trị viên được xem danh sách đầy đủ");
            }
            return ResponseEntity.ok(bacSiService.timTatCa());
        }
        List<BacSiDto> list = bacSiService.timTatCaDangHoatDong();
        if (quyenTruyCapLichLamViecBacSi.chiDuocThaoTacLichLamViecCuaBanThan()) {
            Optional<Long> maBs = quyenTruyCapLichLamViecBacSi.layMaBacSiLienKetVoiTaiKhoan();
            if (maBs.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(
                    list.stream().filter(d -> maBs.get().equals(d.getId())).toList());
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacSiDto> layTheoMa(@PathVariable Long id) {
        quyenTruyCapLichLamViecBacSi.yeuCauDuocTruyCapLichCuaBacSi(id);
        return ResponseEntity.ok(bacSiService.layTheoMa(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<BacSiDto> tao(@Valid @RequestBody TaoBacSiYeuCau yeuCau) {
        return ResponseEntity.ok(bacSiService.tao(yeuCau));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('QUAN_TRI')")
    public ResponseEntity<BacSiDto> capNhat(@PathVariable Long id, @Valid @RequestBody CapNhatBacSiYeuCau yeuCau) {
        return ResponseEntity.ok(bacSiService.capNhat(id, yeuCau));
    }
}
