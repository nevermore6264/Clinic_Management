package com.clinic.service;

import com.clinic.dto.BacSiDto;
import com.clinic.dto.CapNhatBacSiYeuCau;
import com.clinic.dto.TaoBacSiYeuCau;
import com.clinic.entity.BacSi;
import com.clinic.entity.ChuyenKhoa;
import com.clinic.entity.NguoiDung;
import com.clinic.entity.VaiTro;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.ChuyenKhoaRepository;
import com.clinic.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BacSiService {

    private final BacSiRepository bacSiRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ChuyenKhoaRepository chuyenKhoaRepository;

    @Transactional(readOnly = true)
    public List<BacSiDto> timTatCaDangHoatDong() {
        return bacSiRepository.findByHoatDongTrue().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BacSiDto> timTatCa() {
        return bacSiRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BacSiDto layTheoMa(Long ma) {
        return sangDto(bacSiRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ: " + ma)));
    }

    @Transactional
    public BacSiDto tao(TaoBacSiYeuCau yeuCau) {
        if (yeuCau.getMaNguoiDung() == null) {
            String ht = yeuCau.getHoTen() != null ? yeuCau.getHoTen().trim() : "";
            if (ht.isEmpty()) {
                throw new RuntimeException("Vui lòng nhập họ tên hoặc chọn/tạo tài khoản");
            }
            BacSi bs = new BacSi();
            bs.setNguoiDung(null);
            bs.setHoTen(ht);
            if (yeuCau.getMaChuyenKhoa() != null) {
                ChuyenKhoa ck = chuyenKhoaRepository.findById(yeuCau.getMaChuyenKhoa())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa"));
                bs.setChuyenKhoa(ck);
            }
            bs.setBangCap(yeuCau.getBangCap());
            bs.setHoatDong(true);
            return sangDto(bacSiRepository.save(bs));
        }

        NguoiDung nd = nguoiDungRepository.findById(yeuCau.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (!nd.getCacVaiTro().contains(VaiTro.BAC_SI)) {
            throw new RuntimeException("Tài khoản phải có vai trò bác sĩ");
        }
        if (bacSiRepository.findByNguoiDung_Id(nd.getId()).isPresent()) {
            throw new RuntimeException("Người dùng đã được gán hồ sơ bác sĩ");
        }
        BacSi bs = new BacSi();
        bs.setNguoiDung(nd);
        if (yeuCau.getMaChuyenKhoa() != null) {
            ChuyenKhoa ck = chuyenKhoaRepository.findById(yeuCau.getMaChuyenKhoa())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa"));
            bs.setChuyenKhoa(ck);
        }
        bs.setBangCap(yeuCau.getBangCap());
        bs.setHoatDong(true);
        return sangDto(bacSiRepository.save(bs));
    }

    @Transactional
    public BacSiDto capNhat(Long id, CapNhatBacSiYeuCau yeuCau) {
        BacSi bs = bacSiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ: " + id));
        if (yeuCau.getMaChuyenKhoa() != null) {
            ChuyenKhoa ck = chuyenKhoaRepository.findById(yeuCau.getMaChuyenKhoa())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa"));
            bs.setChuyenKhoa(ck);
        } else {
            bs.setChuyenKhoa(null);
        }
        bs.setBangCap(yeuCau.getBangCap());
        bs.setHoatDong(yeuCau.isHoatDong());
        if (bs.getNguoiDung() == null && yeuCau.getHoTen() != null) {
            String ht = yeuCau.getHoTen().trim();
            if (!ht.isEmpty()) {
                bs.setHoTen(ht);
            }
        }
        return sangDto(bacSiRepository.save(bs));
    }

    private BacSiDto sangDto(BacSi bs) {
        BacSiDto dto = new BacSiDto();
        dto.setId(bs.getId());
        if (bs.getNguoiDung() != null) {
            dto.setMaNguoiDung(bs.getNguoiDung().getId());
            dto.setTenDangNhap(bs.getNguoiDung().getTenDangNhap());
            dto.setHoTen(bs.getNguoiDung().getHoTen());
        } else if (bs.getHoTen() != null && !bs.getHoTen().isEmpty()) {
            dto.setHoTen(bs.getHoTen());
        }
        dto.setMaChuyenKhoa(bs.getChuyenKhoa() != null ? bs.getChuyenKhoa().getId() : null);
        dto.setTenChuyenKhoa(bs.getChuyenKhoa() != null ? bs.getChuyenKhoa().getTenChuyenKhoa() : null);
        dto.setBangCap(bs.getBangCap());
        dto.setHoatDong(bs.isHoatDong());
        return dto;
    }
}
