package com.clinic.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtBoLocXacThuc extends OncePerRequestFilter {

    private final JwtTienIch jwtTienIch;
    private final UserDetailsService dichVuChiTietNguoiDung;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        try {
            String token = layTokenTuYeuCau(request);
            if (StringUtils.hasText(token) && jwtTienIch.hopLe(token)) {
                String tenDangNhap = jwtTienIch.layChuoiTenDangNhapTuToken(token);
                UserDetails chiTiet = dichVuChiTietNguoiDung.loadUserByUsername(tenDangNhap);
                var xacThuc = new UsernamePasswordAuthenticationToken(chiTiet, null, chiTiet.getAuthorities());
                xacThuc.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(xacThuc);
            }
        } catch (Exception e) {
            // bo qua
        }
        chain.doFilter(request, response);
    }

    private String layTokenTuYeuCau(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
