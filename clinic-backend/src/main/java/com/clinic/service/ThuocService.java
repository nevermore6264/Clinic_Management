package com.clinic.service;

import com.clinic.dto.ThuocDto;
import com.clinic.entity.Thuoc;
import com.clinic.repository.ThuocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        kiemTraNghiepVu(dto);
        Thuoc t = Thuoc.builder()
                .tenThuoc(dto.getTenThuoc())
                .donVi(dto.getDonVi())
                .hoatChat(dto.getHoatChat())
                .hamLuong(dto.getHamLuong())
                .dangBaoChe(dto.getDangBaoChe())
                .duongDung(dto.getDuongDung())
                .hangSanXuat(dto.getHangSanXuat())
                .nuocSanXuat(dto.getNuocSanXuat())
                .soDangKy(dto.getSoDangKy())
                .soLo(dto.getSoLo())
                .hanSuDung(dto.getHanSuDung())
                .giaNhap(dto.getGiaNhap())
                .giaBan(dto.getGiaBan())
                .tonKho(dto.getTonKho())
                .mucTonToiThieu(dto.getMucTonToiThieu())
                .chiDinh(dto.getChiDinh())
                .chongChiDinh(dto.getChongChiDinh())
                .tacDungPhu(dto.getTacDungPhu())
                .hoatDong(dto.isHoatDong())
                .build();
        return sangDto(thuocRepository.save(t));
    }

    @Transactional
    public ThuocDto capNhat(Long id, ThuocDto dto) {
        kiemTraNghiepVu(dto);
        Thuoc t = thuocRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + id));
        t.setTenThuoc(dto.getTenThuoc());
        t.setDonVi(dto.getDonVi());
        t.setHoatChat(dto.getHoatChat());
        t.setHamLuong(dto.getHamLuong());
        t.setDangBaoChe(dto.getDangBaoChe());
        t.setDuongDung(dto.getDuongDung());
        t.setHangSanXuat(dto.getHangSanXuat());
        t.setNuocSanXuat(dto.getNuocSanXuat());
        t.setSoDangKy(dto.getSoDangKy());
        t.setSoLo(dto.getSoLo());
        t.setHanSuDung(dto.getHanSuDung());
        t.setGiaNhap(dto.getGiaNhap());
        t.setGiaBan(dto.getGiaBan());
        t.setTonKho(dto.getTonKho());
        t.setMucTonToiThieu(dto.getMucTonToiThieu());
        t.setChiDinh(dto.getChiDinh());
        t.setChongChiDinh(dto.getChongChiDinh());
        t.setTacDungPhu(dto.getTacDungPhu());
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
        dto.setHamLuong(t.getHamLuong());
        dto.setDangBaoChe(t.getDangBaoChe());
        dto.setDuongDung(t.getDuongDung());
        dto.setHangSanXuat(t.getHangSanXuat());
        dto.setNuocSanXuat(t.getNuocSanXuat());
        dto.setSoDangKy(t.getSoDangKy());
        dto.setSoLo(t.getSoLo());
        dto.setHanSuDung(t.getHanSuDung());
        dto.setGiaNhap(t.getGiaNhap());
        dto.setGiaBan(t.getGiaBan());
        dto.setTonKho(t.getTonKho());
        dto.setMucTonToiThieu(t.getMucTonToiThieu());
        dto.setChiDinh(t.getChiDinh());
        dto.setChongChiDinh(t.getChongChiDinh());
        dto.setTacDungPhu(t.getTacDungPhu());
        dto.setHoatDong(t.isHoatDong());
        return dto;
    }

    private void kiemTraNghiepVu(ThuocDto dto) {
        if (dto.getHanSuDung() != null && dto.getHanSuDung().isBefore(LocalDate.now())) {
            throw new RuntimeException("Hạn sử dụng không được ở quá khứ.");
        }
        if (dto.getGiaNhap() != null && dto.getGiaNhap().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá nhập không được âm.");
        }
        if (dto.getGiaBan() != null && dto.getGiaBan().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá bán không được âm.");
        }
        if (dto.getGiaNhap() != null && dto.getGiaBan() != null
                && dto.getGiaBan().compareTo(dto.getGiaNhap()) < 0) {
            throw new RuntimeException("Giá bán phải lớn hơn hoặc bằng giá nhập.");
        }
        if (dto.getTonKho() != null && dto.getTonKho() < 0) {
            throw new RuntimeException("Tồn kho không được âm.");
        }
        if (dto.getMucTonToiThieu() != null && dto.getMucTonToiThieu() < 0) {
            throw new RuntimeException("Mức tồn tối thiểu không được âm.");
        }
    }
}
