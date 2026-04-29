package com.clinic.service;

import com.clinic.dto.LoaiDichVuDto;
import com.clinic.entity.LoaiDichVu;
import com.clinic.repository.DichVuRepository;
import com.clinic.repository.LoaiDichVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoaiDichVuService {

    private final LoaiDichVuRepository loaiDichVuRepository;
    private final DichVuRepository dichVuRepository;
    private final NhatKyHeThongService nhatKyHeThongService;

    @Transactional(readOnly = true)
    public List<LoaiDichVuDto> danhSach() {
        return loaiDichVuRepository.findAll().stream().map(this::sangDto).toList();
    }

    @Transactional(readOnly = true)
    public LoaiDichVuDto layTheoMa(Long id) {
        return sangDto(timTheoMa(id));
    }

    @Transactional
    public LoaiDichVuDto tao(LoaiDichVuDto dto) {
        LoaiDichVu loai = new LoaiDichVu();
        loai.setTenLoaiDichVu(dto.getTenLoaiDichVu().trim());
        LoaiDichVu daLuu = loaiDichVuRepository.save(loai);
        nhatKyHeThongService.ghi("loai_dich_vu", daLuu.getId(), "TAO", null, tomTat(daLuu));
        return sangDto(daLuu);
    }

    @Transactional
    public LoaiDichVuDto capNhat(Long id, LoaiDichVuDto dto) {
        LoaiDichVu loai = timTheoMa(id);
        String giaTriCu = tomTat(loai);
        loai.setTenLoaiDichVu(dto.getTenLoaiDichVu().trim());
        LoaiDichVu daLuu = loaiDichVuRepository.save(loai);
        nhatKyHeThongService.ghi("loai_dich_vu", daLuu.getId(), "CAP_NHAT", giaTriCu, tomTat(daLuu));
        return sangDto(daLuu);
    }

    @Transactional
    public void xoa(Long id) {
        LoaiDichVu loai = timTheoMa(id);
        String giaTriCu = tomTat(loai);
        long soDichVuDangDung = dichVuRepository.countByLoaiDichVuId(id);
        if (soDichVuDangDung > 0) {
            throw new RuntimeException("Không thể xóa loại dịch vụ đang được sử dụng bởi " + soDichVuDangDung + " dịch vụ.");
        }
        loaiDichVuRepository.delete(loai);
        nhatKyHeThongService.ghi("loai_dich_vu", id, "XOA", giaTriCu, null);
    }

    private String tomTat(LoaiDichVu loai) {
        return "tenLoaiDichVu=" + loai.getTenLoaiDichVu();
    }

    private LoaiDichVu timTheoMa(Long id) {
        return loaiDichVuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại dịch vụ: " + id));
    }

    private LoaiDichVuDto sangDto(LoaiDichVu loai) {
        LoaiDichVuDto dto = new LoaiDichVuDto();
        dto.setId(loai.getId());
        dto.setTenLoaiDichVu(loai.getTenLoaiDichVu());
        return dto;
    }
}
