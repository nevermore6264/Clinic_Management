package com.clinic.service;

import com.clinic.dto.LichSuTrangThaiLichHenDto;
import com.clinic.entity.LichHen;
import com.clinic.entity.LichSuTrangThaiLichHen;
import com.clinic.repository.LichHenRepository;
import com.clinic.repository.LichSuTrangThaiLichHenRepository;
import com.clinic.security.QuyenTruyCapHoSoBenhNhan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichSuTrangThaiLichHenService {

    private final LichSuTrangThaiLichHenRepository kho;
    private final LichHenRepository lichHenRepository;
    private final QuyenTruyCapHoSoBenhNhan quyenTruyCapHoSoBenhNhan;

    @Transactional(readOnly = true)
    public List<LichSuTrangThaiLichHenDto> layTheoMaLichHen(Long maLichHen) {
        LichHen lh = lichHenRepository.findById(maLichHen).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + maLichHen));
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(lh.getBenhNhan().getId());
        return kho.findByMaLichHenOrderByTaoLuc(maLichHen).stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    private LichSuTrangThaiLichHenDto sangDto(LichSuTrangThaiLichHen e) {
        LichSuTrangThaiLichHenDto dto = new LichSuTrangThaiLichHenDto();
        dto.setId(e.getId());
        dto.setMaLichHen(e.getLichHen().getId());
        dto.setTrangThaiCu(e.getTrangThaiCu() != null ? e.getTrangThaiCu().name() : null);
        dto.setTrangThaiMoi(e.getTrangThaiMoi().name());
        dto.setMaNguoiDung(e.getMaNguoiDung());
        dto.setTenDangNhap(e.getTenDangNhap());
        dto.setGhiChu(e.getGhiChu());
        dto.setTaoLuc(e.getTaoLuc());
        return dto;
    }
}
