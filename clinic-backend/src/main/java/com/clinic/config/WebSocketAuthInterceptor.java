package com.clinic.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor boTruyCap = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (boTruyCap != null && boTruyCap.getSessionAttributes() != null) {
            Map<String, Object> thuocTinh = boTruyCap.getSessionAttributes();
            String tenDangNhap = (String) thuocTinh.get("tenDangNhap");
            Long maNguoiDung = (Long) thuocTinh.get("maNguoiDung");
            if (maNguoiDung == null && thuocTinh.get("maNguoiDung") instanceof Integer i) maNguoiDung = i.longValue();
            if (tenDangNhap != null && maNguoiDung != null) {
                boTruyCap.setUser(new ChatPrincipal(maNguoiDung, tenDangNhap));
            }
        }
        return message;
    }
}
