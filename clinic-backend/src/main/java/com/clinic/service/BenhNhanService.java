package com.clinic.service;

import com.clinic.dto.BenhNhanDto;
import com.clinic.entity.BenhNhan;
import com.clinic.repository.BenhNhanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BenhNhanService {

    private final BenhNhanRepository benhNhanRepository;
    private final NhatKyHeThongService nhatKyHeThongService;

    @Transactional(readOnly = true)
    public Page<BenhNhanDto> timTatCa(Pageable phanTrang) {
        return timLoc(null, true, null, null, phanTrang);
    }

    @Transactional(readOnly = true)
    public Page<BenhNhanDto> timLoc(String ten, Boolean hoatDong, String gioiTinh, String nhomMau, Pageable phanTrang) {
        String t = (ten != null && !ten.isBlank()) ? ten.trim() : null;
        String gt = (gioiTinh != null && !gioiTinh.isBlank()) ? gioiTinh.trim() : null;
        String nm = (nhomMau != null && !nhomMau.isBlank()) ? nhomMau.trim() : null;
        return benhNhanRepository.timLoc(t, hoatDong, gt, nm, phanTrang).map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public List<BenhNhanDto> timTheoTen(String ten) {
        return benhNhanRepository.findByHoTenContainingIgnoreCaseAndHoatDongTrue(ten).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BenhNhanDto layTheoMa(Long ma) {
        return sangDto(benhNhanRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân: " + ma)));
    }

    @Transactional
    public BenhNhanDto tao(BenhNhanDto dto) {
        BenhNhan bn = new BenhNhan();
        mapTuDto(dto, bn);
        bn = benhNhanRepository.save(bn);
        nhatKyHeThongService.ghi("benh_nhan", bn.getId(), "TAO", null, "hoTen=" + bn.getHoTen());
        return sangDto(bn);
    }

    @Transactional
    public BenhNhanDto capNhat(Long ma, BenhNhanDto dto) {
        BenhNhan bn = benhNhanRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân: " + ma));
        String cu = "hoTen=" + bn.getHoTen() + ";soDienThoai=" + bn.getSoDienThoai();
        mapTuDto(dto, bn);
        benhNhanRepository.save(bn);
        String moi = "hoTen=" + bn.getHoTen() + ";soDienThoai=" + bn.getSoDienThoai();
        nhatKyHeThongService.ghi("benh_nhan", ma, "CAP_NHAT", cu, moi);
        return sangDto(bn);
    }

    @Transactional
    public void voHieuHoa(Long ma) {
        BenhNhan bn = benhNhanRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân: " + ma));
        nhatKyHeThongService.ghi("benh_nhan", ma, "VO_HIEU", "hoatDong=true", "hoatDong=false");
        bn.setHoatDong(false);
        benhNhanRepository.save(bn);
    }

    private void mapTuDto(BenhNhanDto dto, BenhNhan bn) {
        bn.setHoTen(dto.getHoTen());
        bn.setNgaySinh(dto.getNgaySinh());
        bn.setSoDienThoai(dto.getSoDienThoai());
        bn.setDiaChi(dto.getDiaChi());
        bn.setThuDienTu(dto.getThuDienTu());
        bn.setGioiTinh(dto.getGioiTinh());
        bn.setSoCccd(dto.getSoCccd());
        bn.setNgheNghiep(dto.getNgheNghiep());
        bn.setNhomMau(dto.getNhomMau());
        bn.setTienSuBenh(dto.getTienSuBenh());
        bn.setDiUng(dto.getDiUng());
        bn.setNguoiLienHe(dto.getNguoiLienHe());
        bn.setSoDienThoaiLienHe(dto.getSoDienThoaiLienHe());
        bn.setHoatDong(dto.isHoatDong());
    }

    private BenhNhanDto sangDto(BenhNhan bn) {
        BenhNhanDto dto = new BenhNhanDto();
        dto.setId(bn.getId());
        dto.setHoTen(bn.getHoTen());
        dto.setNgaySinh(bn.getNgaySinh());
        dto.setSoDienThoai(bn.getSoDienThoai());
        dto.setDiaChi(bn.getDiaChi());
        dto.setThuDienTu(bn.getThuDienTu());
        dto.setGioiTinh(bn.getGioiTinh());
        dto.setSoCccd(bn.getSoCccd());
        dto.setNgheNghiep(bn.getNgheNghiep());
        dto.setNhomMau(bn.getNhomMau());
        dto.setTienSuBenh(bn.getTienSuBenh());
        dto.setDiUng(bn.getDiUng());
        dto.setNguoiLienHe(bn.getNguoiLienHe());
        dto.setSoDienThoaiLienHe(bn.getSoDienThoaiLienHe());
        dto.setHoatDong(bn.isHoatDong());
        return dto;
    }
}
