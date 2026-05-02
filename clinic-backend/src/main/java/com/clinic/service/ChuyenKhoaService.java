package com.clinic.service;

import com.clinic.dto.CapNhatChuyenKhoaYeuCau;
import com.clinic.dto.ChuyenKhoaDto;
import com.clinic.dto.TaoChuyenKhoaYeuCau;
import com.clinic.entity.ChuyenKhoa;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.ChuyenKhoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChuyenKhoaService {

    private final ChuyenKhoaRepository chuyenKhoaRepository;
    private final BacSiRepository bacSiRepository;

    @Transactional(readOnly = true)
    public List<ChuyenKhoaDto> timTatCa() {
        return chuyenKhoaRepository.findAll(Sort.by("tenChuyenKhoa")).stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChuyenKhoaDto tao(TaoChuyenKhoaYeuCau yeuCau) {
        String ten = yeuCau.getTenChuyenKhoa().trim();
        if (ten.isEmpty()) {
            throw new RuntimeException("Tên chuyên khoa không được để trống");
        }
        kiemTraTrungTen(ten, null);
        ChuyenKhoa ck = new ChuyenKhoa();
        ck.setTenChuyenKhoa(ten);
        return sangDto(chuyenKhoaRepository.save(ck));
    }

    @Transactional
    public ChuyenKhoaDto capNhat(Long id, CapNhatChuyenKhoaYeuCau yeuCau) {
        ChuyenKhoa ck = chuyenKhoaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa: " + id));
        String ten = yeuCau.getTenChuyenKhoa().trim();
        if (ten.isEmpty()) {
            throw new RuntimeException("Tên chuyên khoa không được để trống");
        }
        kiemTraTrungTen(ten, id);
        ck.setTenChuyenKhoa(ten);
        return sangDto(chuyenKhoaRepository.save(ck));
    }

    @Transactional
    public void xoa(Long id) {
        ChuyenKhoa ck = chuyenKhoaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa: " + id));
        long dem = bacSiRepository.countByChuyenKhoa_Id(id);
        if (dem > 0) {
            throw new RuntimeException(
                    "Không thể xóa chuyên khoa \"" + ck.getTenChuyenKhoa()
                            + "\" vì đang có " + dem + " bác sĩ gắn với chuyên khoa này.");
        }
        chuyenKhoaRepository.delete(ck);
    }

    private void kiemTraTrungTen(String ten, Long boQuaMa) {
        boolean trung = chuyenKhoaRepository.findAll().stream()
                .filter(x -> boQuaMa == null || !x.getId().equals(boQuaMa))
                .anyMatch(x -> x.getTenChuyenKhoa().trim().equalsIgnoreCase(ten));
        if (trung) {
            throw new RuntimeException("Tên chuyên khoa đã tồn tại");
        }
    }

    private ChuyenKhoaDto sangDto(ChuyenKhoa ck) {
        ChuyenKhoaDto dto = new ChuyenKhoaDto();
        dto.setId(ck.getId());
        dto.setTenChuyenKhoa(ck.getTenChuyenKhoa());
        return dto;
    }
}
