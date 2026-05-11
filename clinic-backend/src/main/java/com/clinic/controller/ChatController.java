package com.clinic.controller;

import com.clinic.config.ChatPrincipal;
import com.clinic.dto.TinNhanChatDto;
import com.clinic.service.TinNhanChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
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

    @MessageMapping("/tro-chuyen.react")
    public void phanUng(@Payload Map<String, Object> payload, ChatPrincipal chuThe) {
        if (chuThe == null) return;
        Object rawId = payload.get("maTinNhan");
        if (rawId == null) rawId = payload.get("messageId");
        if (rawId == null) return;
        Long maTinNhan = parseLong(rawId);
        if (maTinNhan == null || maTinNhan <= 0) return;
        String emoji = chuoi(payload, "emoji", "reaction");
        if (emoji == null) return;
        try {
            TinNhanChatDto dto = tinNhanChatService.capNhatPhanUngRieng(
                    chuThe.maNguoiDung(), maTinNhan, emoji);
            Long a = dto.getMaNguoiGui();
            Long b = dto.getMaNguoiNhan();
            if (a == null || b == null) return;
            String kenh = TinNhanChatService.maKenhDm(a, b);
            khuonMauGui.convertAndSend("/topic/dm/" + kenh, dto);
        } catch (RuntimeException ex) {
            log.debug("Phản ứng tin nhắn thất bại: {}", ex.getMessage());
        }
    }

    private static Long parseLong(Object raw) {
        if (raw instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(raw));
        } catch (Exception ignored) {
            return null;
        }
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
