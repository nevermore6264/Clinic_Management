package com.clinic.controller;

import com.clinic.config.ChatPrincipal;
import com.clinic.dto.TinNhanChatDto;
import com.clinic.service.TinNhanChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final TinNhanChatService tinNhanChatService;
    private final SimpMessagingTemplate khuonMauGui;

    @MessageMapping("/tro-chuyen.send")
    public void guiTin(@Payload Map<String, Object> payload, ChatPrincipal chuThe) {
        if (chuThe == null) return;
        String noiDung = (String) payload.get("noiDung");
        if (noiDung == null) noiDung = (String) payload.get("content");
        String dkUrl = chuoi(payload, "dinhKemDuongDan", "attachUrl");
        String dkTen = chuoi(payload, "dinhKemTen", "attachName");
        String dkLoai = chuoi(payload, "dinhKemLoai", "attachMime");
        boolean coTep = dkUrl != null && !dkUrl.isBlank();
        boolean coChu = noiDung != null && !noiDung.isBlank();
        if (!coTep && !coChu) return;
        Long maNguoiNhan = tachMaNguoiNhan(payload);
        if (maNguoiNhan != null && maNguoiNhan > 0) {
            TinNhanChatDto daLuu = coTep
                    ? tinNhanChatService.luuTinRieng(
                    chuThe.maNguoiDung(),
                    coChu ? noiDung.trim() : null,
                    maNguoiNhan,
                    dkUrl,
                    dkTen,
                    dkLoai)
                    : tinNhanChatService.luuTinRieng(
                    chuThe.maNguoiDung(),
                    noiDung.trim(),
                    maNguoiNhan);
            String kenh = TinNhanChatService.maKenhDm(chuThe.maNguoiDung(), maNguoiNhan);
            khuonMauGui.convertAndSend("/topic/dm/" + kenh, daLuu);
            return;
        }
        if (coTep) return;
        Long maPhong = tachMaPhong(payload);
        TinNhanChatDto daLuu = tinNhanChatService.luuVaChuyenDoi(
                chuThe.maNguoiDung(),
                noiDung != null ? noiDung.trim() : "",
                maPhong
        );
        khuonMauGui.convertAndSend("/topic/room/" + daLuu.getMaPhong(), daLuu);
    }

    private static String chuoi(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object raw = payload.get(key);
            if (raw == null) continue;
            String s = String.valueOf(raw).trim();
            if (!s.isEmpty()) return s;
        }
        return null;
    }

    private Long tachMaNguoiNhan(Map<String, Object> payload) {
        Object raw = payload.get("maNguoiNhan");
        if (raw == null) raw = payload.get("recipientId");
        if (raw == null) return null;
        if (raw instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(raw));
        } catch (Exception ignored) {
            return null;
        }
    }

    private Long tachMaPhong(Map<String, Object> payload) {
        Object raw = payload.containsKey("maPhong") ? payload.get("maPhong")
                : payload.getOrDefault("roomId", 1);
        if (raw instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(raw));
        } catch (Exception ignored) {
            return 1L;
        }
    }
}
