package com.clinic.controller;

import com.clinic.dto.TinNhanChatDto;
import com.clinic.service.TinNhanChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
