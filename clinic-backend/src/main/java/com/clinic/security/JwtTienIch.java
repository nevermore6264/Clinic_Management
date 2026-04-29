package com.clinic.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTienIch {

    @Value("${app.jwt.secret}")
    private String biMatJwt;

    @Value("${app.jwt.expiration-ms}")
    private long thoiGianHetHanMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(biMatJwt.getBytes(StandardCharsets.UTF_8));
    }

    public String taoToken(Authentication xacThuc) {
        NguoiDungChinhThuc chuThe = (NguoiDungChinhThuc) xacThuc.getPrincipal();
        return Jwts.builder()
                .subject(chuThe.getUsername())
                .claim("maNguoiDung", chuThe.getMaNguoiDung())
                .claim("cacVaiTro", chuThe.layCacTenVaiTro())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + thoiGianHetHanMs))
                .signWith(key())
                .compact();
    }

    public String layChuoiTenDangNhapTuToken(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    @SuppressWarnings("unchecked")
    public Long layMaNguoiDungTuToken(String token) {
        var claims = Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
        Object ma = claims.get("maNguoiDung");
        if (ma == null) {
            Object cu = claims.get("userId");
            if (cu instanceof Integer) return ((Integer) cu).longValue();
            if (cu instanceof Long) return (Long) cu;
            return null;
        }
        if (ma instanceof Integer) return ((Integer) ma).longValue();
        if (ma instanceof Long) return (Long) ma;
        return null;
    }

    public boolean hopLe(String token) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
