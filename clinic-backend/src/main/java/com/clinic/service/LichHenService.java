package com.clinic.service;

import com.clinic.dto.LichHenDto;
import com.clinic.dto.BacSiSlotKhaDungDto;
import com.clinic.dto.SlotKhaDungDto;
import com.clinic.entity.*;
import com.clinic.repository.*;
import com.clinic.security.NguoiDungChinhThuc;
import com.clinic.security.QuyenTruyCapHoSoBenhNhan;
import com.clinic.security.QuyenTruyCapLichLamViecBacSi;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichHenService {

    private final LichHenRepository lichHenRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final BacSiRepository bacSiRepository;
    private final DichVuRepository dichVuRepository;
    private final LichLamViecCoDinhRepository lichLamViecCoDinhRepository;
    private final LichNgoaiLeRepository lichNgoaiLeRepository;
    private final LichSuTrangThaiLichHenRepository lichSuTrangThaiLichHenRepository;
    private final QuyenTruyCapHoSoBenhNhan quyenTruyCapHoSoBenhNhan;
    private final QuyenTruyCapLichLamViecBacSi quyenTruyCapLichLamViecBacSi;
    private static final int SUC_CHUA_MOI_GIO = 10;
    private static final EnumSet<LichHen.TrangThaiLichHen> TRANG_THAI_KHONG_TINH_SLOT =
            EnumSet.of(LichHen.TrangThaiLichHen.HUY, LichHen.TrangThaiLichHen.VANG);

    @Transactional(readOnly = true)
    public Page<LichHenDto> timTrongKhoang(LocalDate tuNgay, LocalDate denNgay, Pageable phanTrang) {
        return lichHenRepository.findByNgayHenBetweenOrderByNgayHenAscGioHenAsc(tuNgay, denNgay, phanTrang)
                .map(this::sangDto);
    }

    @Transactional(readOnly = true)
    public List<LichHenDto> timTheoBenhNhan(Long maBenhNhan) {
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(maBenhNhan);
        return lichHenRepository.findByBenhNhanIdOrderByNgayHenDescGioHenDesc(maBenhNhan, Pageable.ofSize(50)).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LichHenDto> timTheoBacSiVaNgay(Long maBacSi, LocalDate ngay) {
        quyenTruyCapLichLamViecBacSi.yeuCauDuocTruyCapLichCuaBacSi(maBacSi);
        return lichHenRepository.findByBacSiIdAndNgayHenOrderByGioHen(maBacSi, ngay).stream()
                .map(this::sangDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LichHenDto layTheoMa(Long ma) {
        LichHen lh = lichHenRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + ma));
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(lh.getBenhNhan().getId());
        return sangDto(lh);
    }

    @Transactional
    public LichHenDto tao(LichHenDto dto) {
        if (!quyenTruyCapHoSoBenhNhan.laNhanVien()) {
            Long lienKet = quyenTruyCapHoSoBenhNhan.layMaBenhNhanLienKetVoiTaiKhoan()
                    .orElseThrow(() -> new AccessDeniedException("Tài khoản chưa được liên kết hồ sơ bệnh nhân."));
            if (!lienKet.equals(dto.getMaBenhNhan())) {
                throw new AccessDeniedException("Chỉ được đặt lịch cho chính mình.");
            }
        }
        if (dto.getNgayHen() == null) {
            throw new RuntimeException("Ngày khám không hợp lệ.");
        }
        if (dto.getNgayHen().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể đặt ngày quá khứ.");
        }
        if (benhNhanTrungGio(dto.getMaBenhNhan(), dto.getNgayHen(), dto.getGioHen(), null)) {
            throw new RuntimeException("Bệnh nhân đã có lịch khác cùng ngày và cùng giờ.");
        }
        if (!slotHopLeVaChuaDay(dto.getMaBacSi(), dto.getNgayHen(), dto.getGioHen(), null)) {
            throw new RuntimeException("Khung giờ không hợp lệ hoặc đã đầy.");
        }
        LichHen lh = new LichHen();
        lh.setBenhNhan(benhNhanRepository.findById(dto.getMaBenhNhan()).orElseThrow());
        lh.setBacSi(bacSiRepository.findById(dto.getMaBacSi()).orElseThrow());
        lh.setDichVu(dichVuRepository.findById(dto.getMaDichVu()).orElseThrow());
        lh.setNgayHen(dto.getNgayHen());
        lh.setGioHen(dto.getGioHen());
        lh.setGhiChu(dto.getGhiChu());
        return sangDto(lichHenRepository.save(lh));
    }

    @Transactional
    public LichHenDto capNhatTrangThai(Long ma, LichHen.TrangThaiLichHen trangThai) {
        if (!quyenTruyCapHoSoBenhNhan.laNhanVien()) {
            throw new AccessDeniedException("Chỉ nhân viên phòng khám mới được cập nhật trạng thái lịch hẹn (hủy, tiếp nhận, …).");
        }
        LichHen lh = lichHenRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + ma));
        LichHen.TrangThaiLichHen cu = lh.getTrangThai();
        if (cu == trangThai) {
            return sangDto(lh);
        }
        lh.setTrangThai(trangThai);
        LichHen daLuu = lichHenRepository.save(lh);
        ghiLichSuTrangThai(daLuu, cu, trangThai);
        return sangDto(daLuu);
    }

    private void ghiLichSuTrangThai(LichHen lichHen, LichHen.TrangThaiLichHen cu, LichHen.TrangThaiLichHen moi) {
        Long maNd = null;
        String tenDn = null;
        Authentication xacThuc = SecurityContextHolder.getContext().getAuthentication();
        if (xacThuc != null && xacThuc.getPrincipal() instanceof NguoiDungChinhThuc p) {
            maNd = p.getMaNguoiDung();
            tenDn = p.getUsername();
        }
        LichSuTrangThaiLichHen dong = LichSuTrangThaiLichHen.builder()
                .lichHen(lichHen)
                .trangThaiCu(cu)
                .trangThaiMoi(moi)
                .maNguoiDung(maNd)
                .tenDangNhap(tenDn)
                .build();
        lichSuTrangThaiLichHenRepository.save(dong);
    }

    @Transactional
    public LichHenDto capNhat(Long ma, LichHenDto dto) {
        LichHen lh = lichHenRepository.findById(ma).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + ma));
        quyenTruyCapHoSoBenhNhan.yeuCauDuocTruyCapHoSo(lh.getBenhNhan().getId());
        if (!quyenTruyCapHoSoBenhNhan.laNhanVien()) {
            if (!dto.getMaBenhNhan().equals(lh.getBenhNhan().getId())) {
                throw new AccessDeniedException("Không được đổi bệnh nhân của lịch.");
            }
        }
        if (benhNhanTrungGio(dto.getMaBenhNhan(), dto.getNgayHen(), dto.getGioHen(), ma)) {
            throw new RuntimeException("Bệnh nhân đã có lịch khác cùng ngày và cùng giờ.");
        }
        if (!slotHopLeVaChuaDay(dto.getMaBacSi(), dto.getNgayHen(), dto.getGioHen(), ma)) {
            throw new RuntimeException("Khung giờ không hợp lệ hoặc đã đầy.");
        }
        lh.setBenhNhan(benhNhanRepository.findById(dto.getMaBenhNhan()).orElseThrow());
        lh.setBacSi(bacSiRepository.findById(dto.getMaBacSi()).orElseThrow());
        lh.setDichVu(dichVuRepository.findById(dto.getMaDichVu()).orElseThrow());
        lh.setNgayHen(dto.getNgayHen());
        lh.setGioHen(dto.getGioHen());
        lh.setGhiChu(dto.getGhiChu());
        return sangDto(lichHenRepository.save(lh));
    }

    private boolean benhNhanTrungGio(Long maBenhNhan, LocalDate ngay, LocalTime gio, Long boQuaMaLich) {
        return lichHenRepository.demBenhNhanTrungGio(maBenhNhan, ngay, gio, boQuaMaLich) > 0;
    }

    @Transactional(readOnly = true)
    public List<BacSiSlotKhaDungDto> timSlotKhaDung(LocalDate ngay, Long maChuyenKhoa) {
        List<BacSi> bacSiHoatDong = maChuyenKhoa == null
                ? bacSiRepository.findByHoatDongTrue()
                : bacSiRepository.findByHoatDongTrueAndChuyenKhoa_Id(maChuyenKhoa);
        return bacSiHoatDong.stream()
                .map(bs -> {
                    BacSiSlotKhaDungDto dto = new BacSiSlotKhaDungDto();
                    dto.setMaBacSi(bs.getId());
                    dto.setTenBacSi(bs.getNguoiDung() != null ? bs.getNguoiDung().getHoTen() : bs.getHoTen());
                    dto.setMaChuyenKhoa(bs.getChuyenKhoa() != null ? bs.getChuyenKhoa().getId() : null);
                    dto.setTenChuyenKhoa(bs.getChuyenKhoa() != null ? bs.getChuyenKhoa().getTenChuyenKhoa() : null);
                    dto.setSlots(tinhSlotChoBacSi(bs.getId(), ngay, null));
                    return dto;
                })
                .filter(x -> x.getSlots() != null && !x.getSlots().isEmpty())
                .collect(Collectors.toList());
    }

    private boolean slotHopLeVaChuaDay(Long maBacSi, LocalDate ngay, LocalTime gioHen, Long boQuaMaLich) {
        String gio = gioHen.toString().substring(0, 5);
        List<SlotKhaDungDto> slots = tinhSlotChoBacSi(maBacSi, ngay, boQuaMaLich);
        return slots.stream().anyMatch(s -> s.getGio().equals(gio) && !s.isDaDay());
    }

    private List<SlotKhaDungDto> tinhSlotChoBacSi(Long maBacSi, LocalDate ngay, Long boQuaMaLich) {
        Set<LocalTime> gioHopLe = layGioHopLeTheoLich(maBacSi, ngay);
        if (gioHopLe.isEmpty()) {
            return List.of();
        }
        List<LichHen> lichTheoNgay = lichHenRepository.findByBacSiIdAndNgayHenAndTrangThaiNotIn(
                maBacSi, ngay, TRANG_THAI_KHONG_TINH_SLOT
        );
        Map<String, Integer> demTheoGio = new HashMap<>();
        for (LichHen lichHen : lichTheoNgay) {
            if (boQuaMaLich != null && boQuaMaLich.equals(lichHen.getId())) {
                continue;
            }
            String gio = lichHen.getGioHen().toString().substring(0, 5);
            demTheoGio.put(gio, demTheoGio.getOrDefault(gio, 0) + 1);
        }
        return gioHopLe.stream()
                .sorted(Comparator.naturalOrder())
                .map(gio -> {
                    String label = gio.toString().substring(0, 5);
                    int daDat = demTheoGio.getOrDefault(label, 0);
                    SlotKhaDungDto dto = new SlotKhaDungDto();
                    dto.setGio(label);
                    dto.setSoLuongDaDat(daDat);
                    dto.setSucChua(SUC_CHUA_MOI_GIO);
                    dto.setDaDay(daDat >= SUC_CHUA_MOI_GIO);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private Set<LocalTime> layGioHopLeTheoLich(Long maBacSi, LocalDate ngay) {
        List<LichNgoaiLe> ngoaiLe = lichNgoaiLeRepository.findByBacSiIdAndNgayNgoaiLe(maBacSi, ngay);
        boolean coNghi = ngoaiLe.stream().anyMatch(x -> x.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.NGHI);
        if (coNghi) {
            return Set.of();
        }
        int thu = ngay.getDayOfWeek().getValue();
        List<Integer> thuCanKiemTra = new ArrayList<>();
        thuCanKiemTra.add(thu);
        int thuChuNhatDangSo0 = thu % 7;
        if (!thuCanKiemTra.contains(thuChuNhatDangSo0)) {
            thuCanKiemTra.add(thuChuNhatDangSo0);
        }
        Set<LocalTime> ketQua = lichLamViecCoDinhRepository.findByBacSiIdAndThuTrongTuanIn(maBacSi, thuCanKiemTra).stream()
                .flatMap(x -> tachTheoCa1Gio(x.getKhungGioBatDau(), x.getKhungGioKetThuc()).stream())
                .collect(Collectors.toCollection(() -> new HashSet<LocalTime>()));
        List<LichNgoaiLe> doiGio = ngoaiLe.stream()
                .filter(x -> x.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.DOI_GIO)
                .toList();
        for (LichNgoaiLe item : doiGio) {
            ketQua.addAll(tachTheoCa1Gio(item.getGioBatDau(), item.getGioKetThuc()));
        }
        return ketQua;
    }

    /**
     * Các giờ bắt đầu lịch (mỗi lượt 1 giờ): bước nhảy 1 giờ từ {@code batDau}, chỉ lấy khi
     * {@code batDau + 1h <= ketThuc}. Nếu biên kết thúc không trùn giờ tròn (vd 19:30), bổ sung
     * thêm một khung bắt đầu lệch nửa giờ sau mốc giờ tròn cuối (vd 17:00–19:30 → thêm 18:30).
     */
    private List<LocalTime> tachTheoCa1Gio(LocalTime batDau, LocalTime ketThuc) {
        if (batDau == null || ketThuc == null || !batDau.isBefore(ketThuc)) {
            return List.of();
        }
        List<LocalTime> gio = new ArrayList<>();
        LocalTime t = batDau;
        LocalTime mocGioTronCuoi = null;
        while (!t.plusHours(1).isAfter(ketThuc)) {
            gio.add(t);
            mocGioTronCuoi = t;
            t = t.plusHours(1);
        }
        if (mocGioTronCuoi != null) {
            LocalTime lechNuaGio = mocGioTronCuoi.plusMinutes(30);
            if (!lechNuaGio.isBefore(batDau) && !lechNuaGio.plusHours(1).isAfter(ketThuc)) {
                gio.add(lechNuaGio);
            }
        }
        gio.sort(Comparator.naturalOrder());
        return gio;
    }

    private LichHenDto sangDto(LichHen lh) {
        LichHenDto dto = new LichHenDto();
        dto.setId(lh.getId());
        dto.setMaBenhNhan(lh.getBenhNhan().getId());
        dto.setTenBenhNhan(lh.getBenhNhan().getHoTen());
        dto.setMaBacSi(lh.getBacSi().getId());
        dto.setTenBacSi(lh.getBacSi().getNguoiDung() != null
                ? lh.getBacSi().getNguoiDung().getHoTen()
                : lh.getBacSi().getHoTen());
        dto.setMaDichVu(lh.getDichVu().getId());
        dto.setTenDichVu(lh.getDichVu().getTen());
        dto.setNgayHen(lh.getNgayHen());
        dto.setGioHen(lh.getGioHen());
        dto.setTrangThai(lh.getTrangThai());
        dto.setGhiChu(lh.getGhiChu());
        dto.setThuDienTuBenhNhan(lh.getBenhNhan().getThuDienTu());
        return dto;
    }
}
