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
        if (noiDung == null || noiDung.isBlank()) return;
        Long maNguoiNhan = tachMaNguoiNhan(payload);
        if (maNguoiNhan != null && maNguoiNhan > 0) {
            TinNhanChatDto daLuu = tinNhanChatService.luuTinRieng(
                    chuThe.maNguoiDung(),
                    noiDung.trim(),
                    maNguoiNhan
            );
            String kenh = TinNhanChatService.maKenhDm(chuThe.maNguoiDung(), maNguoiNhan);
            khuonMauGui.convertAndSend("/topic/dm/" + kenh, daLuu);
            return;
        }
        Long maPhong = tachMaPhong(payload);
        TinNhanChatDto daLuu = tinNhanChatService.luuVaChuyenDoi(
                chuThe.maNguoiDung(),
                noiDung.trim(),
                maPhong
        );
        khuonMauGui.convertAndSend("/topic/room/" + daLuu.getMaPhong(), daLuu);
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
