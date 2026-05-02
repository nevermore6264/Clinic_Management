package com.clinic.controller;

import com.clinic.dto.BacSiDto;
import com.clinic.dto.CapNhatBacSiYeuCau;
import com.clinic.dto.TaoBacSiYeuCau;
import com.clinic.service.BacSiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bac-si")
@RequiredArgsConstructor
public class BacSiController {

    private final BacSiService bacSiService;

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
        return ResponseEntity.ok(bacSiService.timTatCaDangHoatDong());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacSiDto> layTheoMa(@PathVariable Long id) {
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
