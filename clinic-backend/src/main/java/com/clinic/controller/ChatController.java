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
        Long maPhong = tachMaPhong(payload);
        if (noiDung == null || noiDung.isBlank()) return;
        TinNhanChatDto daLuu = tinNhanChatService.luuVaChuyenDoi(
                chuThe.maNguoiDung(),
                noiDung.trim(),
                maPhong
        );
        khuonMauGui.convertAndSend("/topic/room/" + daLuu.getMaPhong(), daLuu);
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
