package com.clinic.service;

import com.clinic.dto.ThuocDto;
import com.clinic.entity.Thuoc;
import com.clinic.repository.ThuocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThuocService {

    private final ThuocRepository thuocRepository;

    @Transactional(readOnly = true)
    public List<ThuocDto> danhSachDangHoatDong() {
        return thuocRepository.findByHoatDongTrue().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ThuocDto> danhSachTatCa() {
        return thuocRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ThuocDto layTheoMa(Long id) {
        return sangDto(thuocRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + id)));
    }

    @Transactional
    public ThuocDto tao(ThuocDto dto) {
        Thuoc t = Thuoc.builder()
                .tenThuoc(dto.getTenThuoc())
                .donVi(dto.getDonVi())
                .hoatChat(dto.getHoatChat())
                .giaBan(dto.getGiaBan())
                .hoatDong(dto.isHoatDong())
                .build();
        return sangDto(thuocRepository.save(t));
    }

    @Transactional
    public ThuocDto capNhat(Long id, ThuocDto dto) {
        Thuoc t = thuocRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + id));
        t.setTenThuoc(dto.getTenThuoc());
        t.setDonVi(dto.getDonVi());
        t.setHoatChat(dto.getHoatChat());
        t.setGiaBan(dto.getGiaBan());
        t.setHoatDong(dto.isHoatDong());
        return sangDto(thuocRepository.save(t));
    }

    @Transactional
    public void voHieuHoa(Long id) {
        Thuoc t = thuocRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + id));
        t.setHoatDong(false);
        thuocRepository.save(t);
    }

    private ThuocDto sangDto(Thuoc t) {
        ThuocDto dto = new ThuocDto();
        dto.setId(t.getId());
        dto.setTenThuoc(t.getTenThuoc());
        dto.setDonVi(t.getDonVi());
        dto.setHoatChat(t.getHoatChat());
        dto.setGiaBan(t.getGiaBan());
        dto.setHoatDong(t.isHoatDong());
        return dto;
    }
}
