package com.clinic.controller;

import com.clinic.dto.NguoiDungChatDto;
import com.clinic.dto.TinNhanChatDto;
import com.clinic.security.NguoiDungChinhThuc;
import com.clinic.service.TinNhanChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tro-chuyen")
@RequiredArgsConstructor
public class LichSuTinNhanController {

    private final TinNhanChatService tinNhanChatService;

    @GetMapping("/lich-su")
    public ResponseEntity<List<TinNhanChatDto>> layLichSu(
            @RequestParam(defaultValue = "1") Long maPhong,
            @RequestParam(defaultValue = "50") int gioiHan) {
        return ResponseEntity.ok(tinNhanChatService.layLichSu(maPhong, Math.min(gioiHan, 100)));
    }

    @GetMapping("/doi-thoai")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TinNhanChatDto>> layDoiThoaiRieng(
            @RequestParam Long maDoiTuong,
            @RequestParam(defaultValue = "100") int gioiHan,
            Authentication authentication) {
        NguoiDungChinhThuc u = (NguoiDungChinhThuc) authentication.getPrincipal();
        return ResponseEntity.ok(tinNhanChatService.layDoiThoaiRieng(
                u.getMaNguoiDung(), maDoiTuong, Math.min(gioiHan, 200)));
    }

    @GetMapping("/danh-ba")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NguoiDungChatDto>> danhBa(Authentication authentication) {
        NguoiDungChinhThuc u = (NguoiDungChinhThuc) authentication.getPrincipal();
        return ResponseEntity.ok(tinNhanChatService.danhBaChat(u.getMaNguoiDung()));
    }
}
