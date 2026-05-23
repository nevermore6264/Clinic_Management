package com.clinic.controller;

import com.clinic.dto.CauHinhNhacLichDto;
import com.clinic.dto.GuiNhacHangLoatYeuCau;
import com.clinic.dto.KetQuaGuiNhacHangLoatDto;
import com.clinic.dto.LichHenDto;
import com.clinic.service.NhacLichHenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cau-hinh-nhac-lich")
@RequiredArgsConstructor
public class CauHinhNhacLichController {

    private final NhacLichHenService nhacLichHenService;

    @GetMapping
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('LE_TAN')")
    public ResponseEntity<CauHinhNhacLichDto> lay() {
        return ResponseEntity.ok(nhacLichHenService.layCauHinh());
    }

    @PutMapping
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('LE_TAN')")
    public ResponseEntity<CauHinhNhacLichDto> capNhat(@RequestBody CauHinhNhacLichDto dto) {
        return ResponseEntity.ok(nhacLichHenService.luuCauHinh(dto));
    }

    @GetMapping("/lich-hen-thu-cong")
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('LE_TAN') or hasRole('THU_NGAN')")
    public ResponseEntity<List<LichHenDto>> danhSachLichHenThuCong(
            @RequestParam(defaultValue = "3") int soNgay) {
        return ResponseEntity.ok(nhacLichHenService.danhSachLichHenNhacThuCong(soNgay));
    }

    @PostMapping("/gui-email-hang-loat")
    @PreAuthorize("hasRole('QUAN_TRI') or hasRole('LE_TAN') or hasRole('THU_NGAN')")
    public ResponseEntity<KetQuaGuiNhacHangLoatDto> guiEmailHangLoat(
            @RequestBody GuiNhacHangLoatYeuCau yeuCau) {
        List<Long> ids = yeuCau != null && yeuCau.getMaLichHen() != null
                ? yeuCau.getMaLichHen()
                : List.of();
        return ResponseEntity.ok(nhacLichHenService.guiNhacThuCongHangLoat(ids));
    }
}
