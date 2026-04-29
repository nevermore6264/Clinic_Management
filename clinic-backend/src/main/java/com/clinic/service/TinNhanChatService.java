package com.clinic.service;

import com.clinic.dto.TinNhanChatDto;
import com.clinic.entity.NguoiDung;
import com.clinic.entity.TinNhanChat;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.repository.TinNhanChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TinNhanChatService {

    private final TinNhanChatRepository khoTinNhan;
    private final NguoiDungRepository nguoiDungRepository;

    private static final Long PHONG_MAC_DINH = 1L;

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

    @Transactional(readOnly = true)
    public List<TinNhanChatDto> layLichSu(Long maPhong, int gioiHan) {
        if (maPhong == null) maPhong = PHONG_MAC_DINH;
        return khoTinNhan.findByMaPhongOrderByTaoLucDesc(maPhong, PageRequest.of(0, gioiHan))
                .stream().sorted((a, b) -> a.getTaoLuc().compareTo(b.getTaoLuc()))
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    private TinNhanChatDto sangDto(TinNhanChat m) {
        TinNhanChatDto dto = new TinNhanChatDto();
        dto.setId(m.getId());
        dto.setMaNguoiGui(m.getNguoiGui() != null ? m.getNguoiGui().getId() : null);
        dto.setTenNguoiGui(m.getNguoiGui() != null ? m.getNguoiGui().getHoTen() : null);
        dto.setNoiDung(m.getNoiDung());
        dto.setMaPhong(m.getMaPhong());
        dto.setTaoLuc(m.getTaoLuc());
        return dto;
    }
}
