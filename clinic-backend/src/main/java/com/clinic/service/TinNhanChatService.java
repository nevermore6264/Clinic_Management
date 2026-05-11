package com.clinic.service;

import com.clinic.dto.NguoiDungChatDto;
import com.clinic.dto.TinNhanChatDto;
import com.clinic.entity.NguoiDung;
import com.clinic.entity.TinNhanChat;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.repository.TinNhanChatRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TinNhanChatService {

    private final TinNhanChatRepository khoTinNhan;
    private final NguoiDungRepository nguoiDungRepository;
    private final ObjectMapper objectMapper;

    private static final Long PHONG_MAC_DINH = 1L;

    private static final Set<String> EMOJI_PHAN_UNG_HOP_LE = Set.of(
            "\uD83D\uDC4D", "\u2764\uFE0F", "\u2764", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDE22",
            "\uD83D\uDE4F", "\uD83D\uDC4F", "\u2705", "\u274C", "\uD83C\uDF89", "\uD83D\uDCAA",
            "\uD83D\uDC99", "\uD83D\uDD25", "\uD83D\uDE4C", "\uD83D\uDCAF", "\u2728");

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
        return luuTinRieng(maNguoiGui, noiDung, maNguoiNhan, null, null, null);
    }

    @Transactional
    public TinNhanChatDto luuTinRieng(Long maNguoiGui, String noiDung, Long maNguoiNhan,
                                      String dinhKemDuongDan, String dinhKemTen, String dinhKemLoai) {
        if (maNguoiNhan == null || maNguoiNhan.equals(maNguoiGui)) {
            throw new RuntimeException("Người nhận không hợp lệ.");
        }
        boolean coTep = dinhKemDuongDan != null && !dinhKemDuongDan.isBlank();
        boolean coChu = noiDung != null && !noiDung.trim().isEmpty();
        if (!coTep && !coChu) {
            throw new RuntimeException("Nội dung hoặc tệp đính kèm không được để trống.");
        }
        String nd = coChu ? noiDung.trim()
                : ("\uD83D\uDCCE " + (dinhKemTen != null && !dinhKemTen.isBlank() ? dinhKemTen : "Tệp"));
        NguoiDung nguoiGui = nguoiDungRepository.findById(maNguoiGui)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi: " + maNguoiGui));
        NguoiDung nguoiNhan = nguoiDungRepository.findById(maNguoiNhan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận: " + maNguoiNhan));
        TinNhanChat.TinNhanChatBuilder b = TinNhanChat.builder()
                .nguoiGui(nguoiGui)
                .nguoiNhan(nguoiNhan)
                .noiDung(nd)
                .maPhong(0L);
        if (coTep) {
            b.dinhKemDuongDan(dinhKemDuongDan.trim())
                    .dinhKemTen(truncate(dinhKemTen, 255))
                    .dinhKemLoai(truncate(dinhKemLoai, 128));
        }
        TinNhanChat tin = khoTinNhan.save(b.build());
        return sangDto(tin);
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
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

    @Transactional
    public TinNhanChatDto capNhatPhanUngRieng(long maNguoiDung, long maTinNhan, String emoji) {
        TinNhanChat tin = khoTinNhan.findById(maTinNhan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn."));
        if (tin.getMaPhong() == null || tin.getMaPhong() != 0L || tin.getNguoiNhan() == null) {
            throw new RuntimeException("Chỉ tin nhắn riêng mới được phản ứng.");
        }
        long maGui = tin.getNguoiGui().getId();
        long maNhan = tin.getNguoiNhan().getId();
        if (maNguoiDung != maGui && maNguoiDung != maNhan) {
            throw new RuntimeException("Không được phản ứng tin nhắn này.");
        }
        String e = Normalizer.normalize(
                emoji != null ? emoji.trim() : "", Normalizer.Form.NFC);
        if (e.isEmpty() || e.length() > 8 || !EMOJI_PHAN_UNG_HOP_LE.contains(e)) {
            throw new RuntimeException("Emoji không hợp lệ.");
        }
        Map<String, String> map = docPhanUng(tin.getPhanUngJson());
        if (map == null) map = new LinkedHashMap<>();
        else map = new LinkedHashMap<>(map);

        String key = String.valueOf(maNguoiDung);
        if (e.equals(map.get(key))) {
            map.remove(key);
        } else {
            map.put(key, e);
        }

        try {
            if (map.isEmpty()) {
                tin.setPhanUngJson(null);
            } else {
                tin.setPhanUngJson(objectMapper.writeValueAsString(map));
            }
        } catch (JsonProcessingException ex) {
            throw new RuntimeException("Lỗi lưu phản ứng.");
        }
        tin = khoTinNhan.save(tin);
        return sangDto(tin);
    }

    private Map<String, String> docPhanUng(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception ignored) {
            return null;
        }
    }

    private TinNhanChatDto sangDto(TinNhanChat m) {
        TinNhanChatDto dto = new TinNhanChatDto();
        dto.setId(m.getId());
        dto.setMaNguoiGui(m.getNguoiGui() != null ? m.getNguoiGui().getId() : null);
        dto.setTenNguoiGui(m.getNguoiGui() != null ? m.getNguoiGui().getHoTen() : null);
        dto.setMaNguoiNhan(m.getNguoiNhan() != null ? m.getNguoiNhan().getId() : null);
        dto.setTenNguoiNhan(m.getNguoiNhan() != null ? m.getNguoiNhan().getHoTen() : null);
        dto.setNoiDung(m.getNoiDung());
        dto.setDinhKemDuongDan(m.getDinhKemDuongDan());
        dto.setDinhKemTen(m.getDinhKemTen());
        dto.setDinhKemLoai(m.getDinhKemLoai());
        dto.setMaPhong(m.getMaPhong());
        dto.setTaoLuc(m.getTaoLuc());
        Map<String, String> phanUng = docPhanUng(m.getPhanUngJson());
        if (phanUng != null && !phanUng.isEmpty()) {
            dto.setPhanUng(phanUng);
        }
        return dto;
    }
}
