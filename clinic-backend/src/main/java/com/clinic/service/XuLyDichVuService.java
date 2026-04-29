package com.clinic.service;

import com.clinic.dto.DichVuDto;
import com.clinic.entity.DichVu;
import com.clinic.repository.DichVuRepository;
import com.clinic.repository.LoaiDichVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XuLyDichVuService {

    private final DichVuRepository dichVuRepository;
    private final LoaiDichVuRepository loaiDichVuRepository;
    private final NhatKyHeThongService nhatKyHeThongService;

    @Transactional(readOnly = true)
    public List<DichVuDto> timTatCaDangHoatDong() {
        return dichVuRepository.findByHoatDongTrue().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DichVuDto layTheoMa(Long ma) {
        return sangDto(dichVuRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ: " + ma)));
    }

    @Transactional
    public DichVuDto tao(DichVuDto dto) {
        DichVu dv = new DichVu();
        mapTuDto(dto, dv);
        DichVu daLuu = dichVuRepository.save(dv);
        nhatKyHeThongService.ghi("dich_vu", daLuu.getId(), "TAO", null, tomTat(daLuu));
        return sangDto(daLuu);
    }

    @Transactional
    public DichVuDto capNhat(Long ma, DichVuDto dto) {
        DichVu dv = dichVuRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ: " + ma));
        String giaTriCu = tomTat(dv);
        boolean hoatDongCu = dv.isHoatDong();
        mapTuDto(dto, dv);
        DichVu daLuu = dichVuRepository.save(dv);
        String hanhDong = "CAP_NHAT";
        if (hoatDongCu && !daLuu.isHoatDong()) {
            hanhDong = "NGUNG";
        } else if (!hoatDongCu && daLuu.isHoatDong()) {
            hanhDong = "MO_LAI";
        }
        nhatKyHeThongService.ghi("dich_vu", daLuu.getId(), hanhDong, giaTriCu, tomTat(daLuu));
        return sangDto(daLuu);
    }

    @Transactional
    public void voHieuHoa(Long ma) {
        DichVu dv = dichVuRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ: " + ma));
        String giaTriCu = tomTat(dv);
        dv.setHoatDong(false);
        DichVu daLuu = dichVuRepository.save(dv);
        nhatKyHeThongService.ghi("dich_vu", daLuu.getId(), "NGUNG", giaTriCu, tomTat(daLuu));
    }

    private String tomTat(DichVu dv) {
        return "ten=" + dv.getTen()
                + ";gia=" + dv.getGia()
                + ";maLoaiDichVu=" + (dv.getLoaiDichVu() != null ? dv.getLoaiDichVu().getId() : null)
                + ";hoatDong=" + dv.isHoatDong();
    }

    private void mapTuDto(DichVuDto dto, DichVu dv) {
        dv.setTen(dto.getTen());
        dv.setMoTa(dto.getMoTa());
        if (dto.getGia() != null) dv.setGia(dto.getGia());
        if (dto.getMaLoaiDichVu() != null) {
            dv.setLoaiDichVu(loaiDichVuRepository.findById(dto.getMaLoaiDichVu())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy loại dịch vụ: " + dto.getMaLoaiDichVu())));
        }
        dv.setHoatDong(dto.isHoatDong());
    }

    private DichVuDto sangDto(DichVu dv) {
        DichVuDto dto = new DichVuDto();
        dto.setId(dv.getId());
        dto.setMaLoaiDichVu(dv.getLoaiDichVu() != null ? dv.getLoaiDichVu().getId() : null);
        dto.setTenLoaiDichVu(dv.getLoaiDichVu() != null ? dv.getLoaiDichVu().getTenLoaiDichVu() : null);
        dto.setTen(dv.getTen());
        dto.setMoTa(dv.getMoTa());
        dto.setGia(dv.getGia());
        dto.setHoatDong(dv.isHoatDong());
        return dto;
    }
}
