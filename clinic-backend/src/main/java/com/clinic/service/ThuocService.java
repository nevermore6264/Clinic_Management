package com.clinic.service;

import com.clinic.dto.DonThuocChiTietBangKeDto;
import com.clinic.dto.ThuocDto;
import com.clinic.entity.ChiTietDonThuoc;
import com.clinic.entity.Thuoc;
import com.clinic.repository.ChiTietDonThuocRepository;
import com.clinic.repository.ThuocRepository;
import com.clinic.repository.ThuocSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThuocService {

    private final ThuocRepository thuocRepository;
    private final ChiTietDonThuocRepository chiTietDonThuocRepository;
    private final NhatKyHeThongService nhatKyHeThongService;

    @Transactional(readOnly = true)
    public List<ThuocDto> danhSachDangHoatDong() {
        return thuocRepository.findByHoatDongTrue().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ThuocDto> danhSachTatCa() {
        return thuocRepository.findAll().stream().map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ThuocDto> timKiem(
            String tuKhoa,
            String trangThai,
            String donVi,
            String dangBaoChe,
            String duongDung,
            String hangSanXuat,
            String nuocSanXuat,
            boolean tonThap,
            LocalDate hanTu,
            LocalDate hanDen,
            BigDecimal giaBanTu,
            BigDecimal giaBanDen,
            Pageable pageable) {
        List<Specification<Thuoc>> phan = new ArrayList<>();
        themNeuCo(phan, ThuocSpecification.tuKhoaChua(tuKhoa));
        themNeuCo(phan, ThuocSpecification.trangThaiHoatDong(trangThai));
        themNeuCo(phan, ThuocSpecification.donViBang(donVi));
        themNeuCo(phan, ThuocSpecification.dangBaoCheBang(dangBaoChe));
        themNeuCo(phan, ThuocSpecification.duongDungBang(duongDung));
        themNeuCo(phan, ThuocSpecification.hangSanXuatBang(hangSanXuat));
        themNeuCo(phan, ThuocSpecification.nuocSanXuatBang(nuocSanXuat));
        themNeuCo(phan, ThuocSpecification.chiTonThap(tonThap));
        themNeuCo(phan, ThuocSpecification.hanSuDungTu(hanTu));
        themNeuCo(phan, ThuocSpecification.hanSuDungDen(hanDen));
        themNeuCo(phan, ThuocSpecification.giaBanTu(giaBanTu));
        themNeuCo(phan, ThuocSpecification.giaBanDen(giaBanDen));
        Specification<Thuoc> spec = phan.stream().reduce(Specification::and)
                .orElseGet(() -> (root, q, cb) -> cb.conjunction());
        return thuocRepository.findAll(spec, pageable).map(this::sangDto);
    }

    private static void themNeuCo(List<Specification<Thuoc>> list, Specification<Thuoc> s) {
        if (s != null) {
            list.add(s);
        }
    }

    @Transactional(readOnly = true)
    public List<DonThuocChiTietBangKeDto> bangKeDonThuocChiTiet() {
        return chiTietDonThuocRepository.bangKeGanNhat(PageRequest.of(0, 2000)).stream()
                .map(this::sangBangKeChiTiet)
                .collect(Collectors.toList());
    }

    private DonThuocChiTietBangKeDto sangBangKeChiTiet(ChiTietDonThuoc ct) {
        DonThuocChiTietBangKeDto d = new DonThuocChiTietBangKeDto();
        d.setMaChiTiet(ct.getId());
        d.setMaDonThuoc(ct.getDonThuoc().getId());
        d.setMaHoSoKham(ct.getDonThuoc().getHoSoKham().getId());
        d.setMaLichHen(ct.getDonThuoc().getHoSoKham().getLichHen().getId());
        d.setTenBenhNhan(ct.getDonThuoc().getHoSoKham().getLichHen().getBenhNhan().getHoTen());
        d.setNgayHen(ct.getDonThuoc().getHoSoKham().getLichHen().getNgayHen());
        d.setGioHen(ct.getDonThuoc().getHoSoKham().getLichHen().getGioHen());
        d.setMaThuoc(ct.getThuoc().getId());
        d.setTenThuoc(ct.getThuoc().getTenThuoc());
        d.setSoLuong(ct.getSoLuong());
        d.setLieuDung(ct.getLieuDung());
        d.setDonGia(ct.getDonGia());
        return d;
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
        Thuoc daLuu = thuocRepository.save(t);
        nhatKyHeThongService.ghi("thuoc", daLuu.getId(), "TAO", null, tomTat(daLuu));
        return sangDto(daLuu);
    }

    @Transactional
    public ThuocDto capNhat(Long id, ThuocDto dto) {
        kiemTraNghiepVu(dto);
        Thuoc t = thuocRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + id));
        String giaTriCu = tomTat(t);
        boolean hoatDongCu = t.isHoatDong();
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
        Thuoc daLuu = thuocRepository.save(t);
        String hanhDong = "CAP_NHAT";
        if (hoatDongCu && !daLuu.isHoatDong()) {
            hanhDong = "NGUNG";
        } else if (!hoatDongCu && daLuu.isHoatDong()) {
            hanhDong = "MO_LAI";
        }
        nhatKyHeThongService.ghi("thuoc", daLuu.getId(), hanhDong, giaTriCu, tomTat(daLuu));
        return sangDto(daLuu);
    }

    @Transactional
    public void xoa(Long id) {
        Thuoc t = thuocRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + id));
        String giaTriCu = tomTat(t);
        thuocRepository.deleteById(id);
        nhatKyHeThongService.ghi("thuoc", id, "XOA", giaTriCu, null);
    }

    private String tomTat(Thuoc t) {
        return "tenThuoc=" + t.getTenThuoc()
                + ";giaBan=" + t.getGiaBan()
                + ";tonKho=" + t.getTonKho()
                + ";hoatDong=" + t.isHoatDong();
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
        BigDecimal gn = dto.getGiaNhap() != null ? dto.getGiaNhap() : BigDecimal.ZERO;
        BigDecimal gb = dto.getGiaBan() != null ? dto.getGiaBan() : BigDecimal.ZERO;
        if (gn.compareTo(BigDecimal.ZERO) > 0 && gb.compareTo(gn) <= 0) {
            throw new RuntimeException("Giá nhập phải nhỏ hơn giá bán.");
        }
        if (dto.getTonKho() != null && dto.getTonKho() < 0) {
            throw new RuntimeException("Tồn kho không được âm.");
        }
        if (dto.getMucTonToiThieu() != null && dto.getMucTonToiThieu() < 0) {
            throw new RuntimeException("Mức tồn tối thiểu không được âm.");
        }
    }
}
