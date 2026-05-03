package com.clinic.service;

import com.clinic.dto.NguoiDungChatDto;
import com.clinic.dto.TinNhanChatDto;
import com.clinic.entity.NguoiDung;
import com.clinic.entity.TinNhanChat;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.repository.TinNhanChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TinNhanChatService {

    private final TinNhanChatRepository khoTinNhan;
    private final NguoiDungRepository nguoiDungRepository;

    private static final Long PHONG_MAC_DINH = 1L;

    public static String maKenhDm(Long maA, Long maB) {
        long lo = Math.min(maA, maB);
        long hi = Math.max(maA, maB);
        return lo + "-" + hi;
    }

    @Transactional
    public TinNhanChatDto luuVaChuyenDoi(Long maNguoiGui, String noiDung, Long maPhong) {
        if (maPhong == null) maPhong = PHONG_MAC_DINH;
        NguoiDung nguoiGui = nguoiDungRepository.findById(maNguoiGui)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi: " + maNguoiGui));
        TinNhanChat tin = TinNhanChat.builder()
                .nguoiGui(nguoiGui)
                .noiDung(noiDung != null ? noiDung : "")
                .maPhong(maPhong)
                .build();
        tin = khoTinNhan.save(tin);
        return sangDto(tin);
    }

    @Transactional
    public TinNhanChatDto luuTinRieng(Long maNguoiGui, String noiDung, Long maNguoiNhan) {
        if (maNguoiNhan == null || maNguoiNhan.equals(maNguoiGui)) {
            throw new RuntimeException("Người nhận không hợp lệ.");
        }
        NguoiDung nguoiGui = nguoiDungRepository.findById(maNguoiGui)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi: " + maNguoiGui));
        NguoiDung nguoiNhan = nguoiDungRepository.findById(maNguoiNhan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận: " + maNguoiNhan));
        TinNhanChat tin = TinNhanChat.builder()
                .nguoiGui(nguoiGui)
                .nguoiNhan(nguoiNhan)
                .noiDung(noiDung != null ? noiDung : "")
                .maPhong(0L)
                .build();
        tin = khoTinNhan.save(tin);
        return sangDto(tin);
    }

    @Transactional(readOnly = true)
    public List<TinNhanChatDto> layLichSu(Long maPhong, int gioiHan) {
        if (maPhong == null) maPhong = PHONG_MAC_DINH;
        return khoTinNhan.findByMaPhongOrderByTaoLucDesc(maPhong, PageRequest.of(0, gioiHan))
                .stream().sorted((a, b) -> a.getTaoLuc().compareTo(b.getTaoLuc()))
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TinNhanChatDto> layDoiThoaiRieng(Long maNguoiDung, Long maDoiTuong, int gioiHan) {
        if (maDoiTuong == null || maDoiTuong.equals(maNguoiDung)) {
            throw new RuntimeException("Đối tượng trò chuyện không hợp lệ.");
        }
        int limit = Math.min(Math.max(gioiHan, 1), 200);
        List<TinNhanChat> ds = khoTinNhan.timDoiThoai(maNguoiDung, maDoiTuong, PageRequest.of(0, limit));
        List<TinNhanChat> xep = new ArrayList<>(ds);
        Collections.reverse(xep);
        return xep.stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NguoiDungChatDto> danhBaChat(Long boQuaMaNguoiDung) {
        return nguoiDungRepository.findByHoatDongTrueOrderByHoTenAsc().stream()
                .filter(u -> !u.getId().equals(boQuaMaNguoiDung))
                .map(u -> new NguoiDungChatDto(u.getId(), u.getHoTen(), u.getTenDangNhap()))
                .collect(Collectors.toList());
    }

    private TinNhanChatDto sangDto(TinNhanChat m) {
        TinNhanChatDto dto = new TinNhanChatDto();
        dto.setId(m.getId());
        dto.setMaNguoiGui(m.getNguoiGui() != null ? m.getNguoiGui().getId() : null);
        dto.setTenNguoiGui(m.getNguoiGui() != null ? m.getNguoiGui().getHoTen() : null);
        dto.setMaNguoiNhan(m.getNguoiNhan() != null ? m.getNguoiNhan().getId() : null);
        dto.setTenNguoiNhan(m.getNguoiNhan() != null ? m.getNguoiNhan().getHoTen() : null);
        dto.setNoiDung(m.getNoiDung());
        dto.setMaPhong(m.getMaPhong());
        dto.setTaoLuc(m.getTaoLuc());
        return dto;
    }
}
