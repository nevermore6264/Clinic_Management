package com.clinic.config;

import com.clinic.security.JwtTienIch;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketHandshakeHandler implements HandshakeInterceptor {

    private final JwtTienIch jwtTienIch;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler handler, Map<String, Object> thuocTinh) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) return false;
        String token = servletRequest.getServletRequest().getParameter("token");
        if (token == null || token.isBlank() || !jwtTienIch.hopLe(token)) {
            return false;
        }
        try {
            String tenDangNhap = jwtTienIch.layChuoiTenDangNhapTuToken(token);
            Long maNguoiDung = jwtTienIch.layMaNguoiDungTuToken(token);
            thuocTinh.put("tenDangNhap", tenDangNhap);
            thuocTinh.put("maNguoiDung", maNguoiDung != null ? maNguoiDung : 0L);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler handler, Exception ex) {
    }
}
