package com.clinic.service;

import com.clinic.dto.LichCoDinhDto;
import com.clinic.dto.LichLamViecBacSiDto;
import com.clinic.entity.BacSi;
import com.clinic.entity.LichLamViecBacSi;
import com.clinic.entity.LichLamViecCoDinh;
import com.clinic.entity.LichNgoaiLe;
import com.clinic.repository.BacSiRepository;
import com.clinic.repository.LichLamViecBacSiRepository;
import com.clinic.repository.LichLamViecCoDinhRepository;
import com.clinic.repository.LichNgoaiLeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LichLamViecBacSiService {

    public static final String NGUON_NGOAI_LE = "NGOAI_LE";
    public static final String NGUON_CO_DINH = "CO_DINH";
    public static final String NGUON_LICH_BAC_SI = "LICH_BAC_SI_THU_VIEN";

    public static final LocalTime GIO_HANH_CHINH_SANG_BAT_DAU = LocalTime.of(7, 30);
    public static final LocalTime GIO_HANH_CHINH_SANG_KET_THUC = LocalTime.of(11, 30);
    public static final LocalTime GIO_HANH_CHINH_CHIEU_BAT_DAU = LocalTime.of(13, 0);
    public static final LocalTime GIO_HANH_CHINH_CHIEU_KET_THUC = LocalTime.of(17, 0);
    public static final List<Integer> NGAY_LAM_VIEC_MAC_DINH = List.of(1, 2, 3, 4, 5, 6);

    private final LichLamViecBacSiRepository khoLichLamViec;
    private final BacSiRepository khoBacSi;
    private final LichNgoaiLeRepository lichNgoaiLeRepository;
    private final LichLamViecCoDinhRepository lichLamViecCoDinhRepository;

    @Transactional(readOnly = true)
    public List<LichLamViecBacSiDto> timTheoBacSiVaNgay(Long maBacSi, LocalDate ngay) {
        BacSi bs = khoBacSi.findById(maBacSi).orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        String tenBs = layTenBacSi(bs);
        List<LichLamViecBacSiDto> ketQua = new ArrayList<>();
        List<LichNgoaiLe> ngoaiLe = lichNgoaiLeRepository.findByBacSiIdAndNgayNgoaiLe(maBacSi, ngay);
        List<LichNgoaiLe> nghiRows = ngoaiLe.stream()
                .filter(x -> x.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.NGHI)
                .toList();
        if (!nghiRows.isEmpty()) {
            ketQua.add(sangDtoTuNgoaiLe(nghiRows.get(0), maBacSi, tenBs, ngay));
            return ketQua;
        }
        int thu = ngay.getDayOfWeek().getValue();
        Set<Integer> thuCan = new LinkedHashSet<>();
        thuCan.add(thu);
        thuCan.add(thu % 7);
        List<LichLamViecCoDinh> coDinh = lichLamViecCoDinhRepository.findByBacSiIdAndThuTrongTuanIn(maBacSi, thuCan);
        coDinh.sort(Comparator.comparing(LichLamViecCoDinh::getThuTrongTuan, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(LichLamViecCoDinh::getId));
        for (LichLamViecCoDinh cd : coDinh) {
            ketQua.add(sangDtoTuCoDinh(cd, maBacSi, tenBs, ngay));
        }
        List<LichNgoaiLe> doiGio = ngoaiLe.stream()
                .filter(x -> x.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.DOI_GIO)
                .sorted(Comparator.comparing(LichNgoaiLe::getId))
                .toList();
        for (LichNgoaiLe nl : doiGio) {
            ketQua.add(sangDtoTuNgoaiLe(nl, maBacSi, tenBs, ngay));
        }
        List<LichLamViecBacSi> legacy = khoLichLamViec.findByBacSiIdAndNgayLich(maBacSi, ngay);
        for (LichLamViecBacSi leg : legacy) {
            ketQua.add(sangDtoLegacy(leg, tenBs));
        }
        ketQua.sort(Comparator.comparing(LichLamViecBacSiDto::getKhungGioBatDau, Comparator.nullsLast(LocalTime::compareTo)));
        return ketQua;
    }

    @Transactional(readOnly = true)
    public List<LichLamViecBacSiDto> timTheoBacSiVaKhoangNgay(Long maBacSi, LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay.isAfter(denNgay)) {
            return List.of();
        }
        List<LichLamViecBacSiDto> tatCa = new ArrayList<>();
        for (LocalDate d = tuNgay; !d.isAfter(denNgay); d = d.plusDays(1)) {
            tatCa.addAll(timTheoBacSiVaNgay(maBacSi, d));
        }
        return tatCa;
    }

    @Transactional
    public LichLamViecBacSiDto tao(LichLamViecBacSiDto dto) {
        BacSi bs = khoBacSi.findById(dto.getMaBacSi()).orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        LocalDate ngay = dto.getNgayLich();
        if (ngay == null) {
            throw new RuntimeException("Ngày lịch là bắt buộc.");
        }
        if (Boolean.TRUE.equals(dto.getNghiCaNgay())) {
            LichNgoaiLe nl = LichNgoaiLe.builder()
                    .bacSi(bs)
                    .ngayNgoaiLe(ngay)
                    .loaiNgoaiLe(LichNgoaiLe.LoaiNgoaiLe.NGHI)
                    .build();
            LichNgoaiLe daLuu = lichNgoaiLeRepository.save(nl);
            return sangDtoTuNgoaiLe(daLuu, bs.getId(), layTenBacSi(bs), ngay);
        }
        if (dto.getKhungGioBatDau() == null || dto.getKhungGioKetThuc() == null) {
            throw new RuntimeException("Khung giờ bắt đầu và kết thúc là bắt buộc.");
        }
        if (!dto.getKhungGioBatDau().isBefore(dto.getKhungGioKetThuc())) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc.");
        }
        kiemTraNgoaiGioHanhChinh(bs.getId(), ngay, dto.getKhungGioBatDau(), dto.getKhungGioKetThuc());
        LichNgoaiLe nl = LichNgoaiLe.builder()
                .bacSi(bs)
                .ngayNgoaiLe(ngay)
                .loaiNgoaiLe(LichNgoaiLe.LoaiNgoaiLe.DOI_GIO)
                .gioBatDau(dto.getKhungGioBatDau())
                .gioKetThuc(dto.getKhungGioKetThuc())
                .build();
        LichNgoaiLe daLuu = lichNgoaiLeRepository.save(nl);
        return sangDtoTuNgoaiLe(daLuu, bs.getId(), layTenBacSi(bs), ngay);
    }

    private void kiemTraNgoaiGioHanhChinh(Long maBacSi, LocalDate ngay,
                                         LocalTime batDau, LocalTime ketThuc) {
        int thu = ngay.getDayOfWeek().getValue();
        Set<Integer> thuCan = new LinkedHashSet<>();
        thuCan.add(thu);
        thuCan.add(thu % 7);
        List<LichLamViecCoDinh> coDinh = lichLamViecCoDinhRepository.findByBacSiIdAndThuTrongTuanIn(maBacSi, thuCan);
        for (LichLamViecCoDinh cd : coDinh) {
            LocalTime a = cd.getKhungGioBatDau();
            LocalTime b = cd.getKhungGioKetThuc();
            if (a == null || b == null) continue;
            if (batDau.isBefore(b) && a.isBefore(ketThuc)) {
                throw new RuntimeException(
                        "Ca ngoại lệ " + batDau + "–" + ketThuc
                        + " chồng với giờ hành chính " + a + "–" + b
                        + ". Ngoại lệ chỉ được tạo ngoài khung giờ hành chính.");
            }
        }
    }

    @Transactional
    public LichLamViecBacSiDto capNhat(Long id, LichLamViecBacSiDto dto) {
        String nguon = dto.getNguonBanGhi();
        if (nguon != null && nguon.equalsIgnoreCase(NGUON_NGOAI_LE)) {
            LichNgoaiLe nl = lichNgoaiLeRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy ngoại lệ"));
            if (nl.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.NGHI) {
                nl.setNgayNgoaiLe(dto.getNgayLich() != null ? dto.getNgayLich() : nl.getNgayNgoaiLe());
            } else {
                if (dto.getKhungGioBatDau() == null || dto.getKhungGioKetThuc() == null) {
                    throw new RuntimeException("Khung giờ bắt đầu và kết thúc là bắt buộc.");
                }
                if (!dto.getKhungGioBatDau().isBefore(dto.getKhungGioKetThuc())) {
                    throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc.");
                }
                LocalDate ngayKt = dto.getNgayLich() != null ? dto.getNgayLich() : nl.getNgayNgoaiLe();
                kiemTraNgoaiGioHanhChinh(nl.getBacSi().getId(), ngayKt,
                        dto.getKhungGioBatDau(), dto.getKhungGioKetThuc());
                nl.setGioBatDau(dto.getKhungGioBatDau());
                nl.setGioKetThuc(dto.getKhungGioKetThuc());
                if (dto.getNgayLich() != null) {
                    nl.setNgayNgoaiLe(dto.getNgayLich());
                }
            }
            LichNgoaiLe daLuu = lichNgoaiLeRepository.save(nl);
            LocalDate ngay = daLuu.getNgayNgoaiLe();
            return sangDtoTuNgoaiLe(daLuu, daLuu.getBacSi().getId(), layTenBacSi(daLuu.getBacSi()), ngay);
        }
        if (nguon != null && nguon.equalsIgnoreCase(NGUON_CO_DINH)) {
            LichLamViecCoDinh cd = lichLamViecCoDinhRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch cố định"));
            if (dto.getKhungGioBatDau() != null) {
                cd.setKhungGioBatDau(dto.getKhungGioBatDau());
            }
            if (dto.getKhungGioKetThuc() != null) {
                cd.setKhungGioKetThuc(dto.getKhungGioKetThuc());
            }
            LichLamViecCoDinh daLuu = lichLamViecCoDinhRepository.save(cd);
            LocalDate ngayHien = dto.getNgayLich() != null ? dto.getNgayLich() : LocalDate.now();
            return sangDtoTuCoDinh(daLuu, daLuu.getBacSi().getId(), layTenBacSi(daLuu.getBacSi()), ngayHien);
        }
        LichLamViecBacSi s = khoLichLamViec.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch làm việc (bản ghi cũ)"));
        s.setNgayLich(dto.getNgayLich());
        s.setKhungGioBatDau(dto.getKhungGioBatDau());
        s.setKhungGioKetThuc(dto.getKhungGioKetThuc());
        return sangDtoLegacy(khoLichLamViec.save(s), layTenBacSi(s.getBacSi()));
    }

    @Transactional
    public void xoa(Long id, String nguon) {
        if (nguon != null && !nguon.isBlank()) {
            if (NGUON_NGOAI_LE.equalsIgnoreCase(nguon)) {
                lichNgoaiLeRepository.deleteById(id);
                return;
            }
            if (NGUON_CO_DINH.equalsIgnoreCase(nguon)) {
                lichLamViecCoDinhRepository.deleteById(id);
                return;
            }
            if (NGUON_LICH_BAC_SI.equalsIgnoreCase(nguon)) {
                khoLichLamViec.deleteById(id);
                return;
            }
            throw new RuntimeException("Tham số nguon không hợp lệ: " + nguon);
        }
        if (lichNgoaiLeRepository.existsById(id)) {
            lichNgoaiLeRepository.deleteById(id);
        } else if (lichLamViecCoDinhRepository.existsById(id)) {
            lichLamViecCoDinhRepository.deleteById(id);
        } else {
            khoLichLamViec.deleteById(id);
        }
    }

    @Transactional(readOnly = true)
    public List<LichCoDinhDto> layCoDinhTheoBacSi(Long maBacSi) {
        BacSi bs = khoBacSi.findById(maBacSi).orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        String tenBs = layTenBacSi(bs);
        return lichLamViecCoDinhRepository
                .findByBacSiIdOrderByThuTrongTuanAscKhungGioBatDauAsc(maBacSi)
                .stream()
                .map(cd -> sangDtoCoDinh(cd, tenBs))
                .toList();
    }

    @Transactional
    public LichCoDinhDto taoCoDinh(LichCoDinhDto dto) {
        if (dto.getMaBacSi() == null) {
            throw new RuntimeException("Mã bác sĩ là bắt buộc.");
        }
        if (dto.getThuTrongTuan() == null || dto.getThuTrongTuan() < 1 || dto.getThuTrongTuan() > 7) {
            throw new RuntimeException("Thứ trong tuần phải nằm trong khoảng 1..7.");
        }
        if (dto.getKhungGioBatDau() == null || dto.getKhungGioKetThuc() == null) {
            throw new RuntimeException("Khung giờ bắt đầu và kết thúc là bắt buộc.");
        }
        if (!dto.getKhungGioBatDau().isBefore(dto.getKhungGioKetThuc())) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc.");
        }
        BacSi bs = khoBacSi.findById(dto.getMaBacSi())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        LichLamViecCoDinh cd = LichLamViecCoDinh.builder()
                .bacSi(bs)
                .thuTrongTuan(dto.getThuTrongTuan())
                .khungGioBatDau(dto.getKhungGioBatDau())
                .khungGioKetThuc(dto.getKhungGioKetThuc())
                .build();
        LichLamViecCoDinh daLuu = lichLamViecCoDinhRepository.save(cd);
        return sangDtoCoDinh(daLuu, layTenBacSi(bs));
    }

    @Transactional
    public LichCoDinhDto capNhatCoDinh(Long id, LichCoDinhDto dto) {
        LichLamViecCoDinh cd = lichLamViecCoDinhRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch cố định"));
        if (dto.getThuTrongTuan() != null) {
            if (dto.getThuTrongTuan() < 1 || dto.getThuTrongTuan() > 7) {
                throw new RuntimeException("Thứ trong tuần phải nằm trong khoảng 1..7.");
            }
            cd.setThuTrongTuan(dto.getThuTrongTuan());
        }
        if (dto.getKhungGioBatDau() != null) {
            cd.setKhungGioBatDau(dto.getKhungGioBatDau());
        }
        if (dto.getKhungGioKetThuc() != null) {
            cd.setKhungGioKetThuc(dto.getKhungGioKetThuc());
        }
        if (cd.getKhungGioBatDau() == null || cd.getKhungGioKetThuc() == null
                || !cd.getKhungGioBatDau().isBefore(cd.getKhungGioKetThuc())) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc.");
        }
        LichLamViecCoDinh daLuu = lichLamViecCoDinhRepository.save(cd);
        return sangDtoCoDinh(daLuu, layTenBacSi(daLuu.getBacSi()));
    }

    @Transactional
    public void xoaCoDinh(Long id) {
        lichLamViecCoDinhRepository.deleteById(id);
    }

    @Transactional
    public List<LichCoDinhDto> gieoMacDinhChoBacSi(Long maBacSi, boolean ghiDe) {
        BacSi bs = khoBacSi.findById(maBacSi)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));
        long daCo = lichLamViecCoDinhRepository.countByBacSiId(maBacSi);
        if (daCo > 0) {
            if (!ghiDe) {
                return layCoDinhTheoBacSi(maBacSi);
            }
            lichLamViecCoDinhRepository.deleteByBacSiId(maBacSi);
        }
        List<LichLamViecCoDinh> daTao = new ArrayList<>();
        for (Integer thu : NGAY_LAM_VIEC_MAC_DINH) {
            daTao.add(lichLamViecCoDinhRepository.save(LichLamViecCoDinh.builder()
                    .bacSi(bs)
                    .thuTrongTuan(thu)
                    .khungGioBatDau(GIO_HANH_CHINH_SANG_BAT_DAU)
                    .khungGioKetThuc(GIO_HANH_CHINH_SANG_KET_THUC)
                    .build()));
            daTao.add(lichLamViecCoDinhRepository.save(LichLamViecCoDinh.builder()
                    .bacSi(bs)
                    .thuTrongTuan(thu)
                    .khungGioBatDau(GIO_HANH_CHINH_CHIEU_BAT_DAU)
                    .khungGioKetThuc(GIO_HANH_CHINH_CHIEU_KET_THUC)
                    .build()));
        }
        String tenBs = layTenBacSi(bs);
        return daTao.stream().map(cd -> sangDtoCoDinh(cd, tenBs)).toList();
    }

    @Transactional
    public int gieoMacDinhChoTatCaBacSi(boolean ghiDe) {
        int soBacSi = 0;
        for (BacSi bs : khoBacSi.findAll()) {
            long daCo = lichLamViecCoDinhRepository.countByBacSiId(bs.getId());
            if (daCo > 0 && !ghiDe) {
                continue;
            }
            gieoMacDinhChoBacSi(bs.getId(), ghiDe);
            soBacSi++;
        }
        return soBacSi;
    }

    private String layTenBacSi(BacSi bs) {
        if (bs.getNguoiDung() != null) {
            return bs.getNguoiDung().getHoTen();
        }
        return bs.getHoTen();
    }

    private LichLamViecBacSiDto sangDtoTuNgoaiLe(LichNgoaiLe nl, Long maBacSi, String tenBs, LocalDate ngay) {
        LichLamViecBacSiDto dto = new LichLamViecBacSiDto();
        dto.setId(nl.getId());
        dto.setMaBacSi(maBacSi);
        dto.setTenBacSi(tenBs);
        dto.setNgayLich(ngay);
        if (nl.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.NGHI) {
            dto.setKhungGioBatDau(null);
            dto.setKhungGioKetThuc(null);
        } else {
            dto.setKhungGioBatDau(nl.getGioBatDau());
            dto.setKhungGioKetThuc(nl.getGioKetThuc());
        }
        dto.setNguonBanGhi(NGUON_NGOAI_LE);
        dto.setNghiCaNgay(nl.getLoaiNgoaiLe() == LichNgoaiLe.LoaiNgoaiLe.NGHI);
        return dto;
    }

    private LichLamViecBacSiDto sangDtoTuCoDinh(LichLamViecCoDinh cd, Long maBacSi, String tenBs, LocalDate ngay) {
        LichLamViecBacSiDto dto = new LichLamViecBacSiDto();
        dto.setId(cd.getId());
        dto.setMaBacSi(maBacSi);
        dto.setTenBacSi(tenBs);
        dto.setNgayLich(ngay);
        dto.setKhungGioBatDau(cd.getKhungGioBatDau());
        dto.setKhungGioKetThuc(cd.getKhungGioKetThuc());
        dto.setNguonBanGhi(NGUON_CO_DINH);
        dto.setNghiCaNgay(false);
        return dto;
    }

    private LichLamViecBacSiDto sangDtoLegacy(LichLamViecBacSi s, String tenBs) {
        LichLamViecBacSiDto dto = new LichLamViecBacSiDto();
        dto.setId(s.getId());
        dto.setMaBacSi(s.getBacSi().getId());
        dto.setTenBacSi(tenBs != null ? tenBs : layTenBacSi(s.getBacSi()));
        dto.setNgayLich(s.getNgayLich());
        dto.setKhungGioBatDau(s.getKhungGioBatDau());
        dto.setKhungGioKetThuc(s.getKhungGioKetThuc());
        dto.setNguonBanGhi(NGUON_LICH_BAC_SI);
        dto.setNghiCaNgay(false);
        return dto;
    }

    private LichCoDinhDto sangDtoCoDinh(LichLamViecCoDinh cd, String tenBs) {
        LichCoDinhDto dto = new LichCoDinhDto();
        dto.setId(cd.getId());
        dto.setMaBacSi(cd.getBacSi() != null ? cd.getBacSi().getId() : null);
        dto.setTenBacSi(tenBs);
        dto.setThuTrongTuan(cd.getThuTrongTuan());
        dto.setKhungGioBatDau(cd.getKhungGioBatDau());
        dto.setKhungGioKetThuc(cd.getKhungGioKetThuc());
        return dto;
    }
}
