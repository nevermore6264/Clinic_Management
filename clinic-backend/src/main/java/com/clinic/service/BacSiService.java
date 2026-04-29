package com.clinic.service;

import com.clinic.dto.BacSiDto;
import com.clinic.entity.BacSi;
import com.clinic.repository.BacSiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BacSiService {

    private final BacSiRepository bacSiRepository;

    @Transactional(readOnly = true)
    public List<BacSiDto> timTatCaDangHoatDong() {
        return bacSiRepository.findByHoatDongTrue().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BacSiDto layTheoMa(Long ma) {
        return sangDto(bacSiRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ: " + ma)));
    }

    private BacSiDto sangDto(BacSi bs) {
        BacSiDto dto = new BacSiDto();
        dto.setId(bs.getId());
        dto.setHoTen(bs.getNguoiDung() != null ? bs.getNguoiDung().getHoTen() : null);
        dto.setMaChuyenKhoa(bs.getChuyenKhoa() != null ? bs.getChuyenKhoa().getId() : null);
        dto.setTenChuyenKhoa(bs.getChuyenKhoa() != null ? bs.getChuyenKhoa().getTenChuyenKhoa() : null);
        dto.setBangCap(bs.getBangCap());
        dto.setHoatDong(bs.isHoatDong());
        return dto;
    }
}
