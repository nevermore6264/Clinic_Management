package com.clinic.security;

import com.clinic.entity.BacSi;
import com.clinic.entity.VaiTro;
import com.clinic.repository.BacSiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class QuyenTruyCapLichLamViecBacSi {

    private final BacSiRepository bacSiRepository;

    public Optional<Long> layMaBacSiLienKetVoiTaiKhoan() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof NguoiDungChinhThuc u)) {
            return Optional.empty();
        }
        return bacSiRepository.findByNguoiDung_Id(u.getMaNguoiDung()).map(BacSi::getId);
    }

    public boolean duocQuanLyLichCuaMoiBacSi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof NguoiDungChinhThuc u)) {
            return false;
        }
        Set<String> r = u.layCacTenVaiTro();
        return r.contains(VaiTro.QUAN_TRI.name())
                || r.contains(VaiTro.LE_TAN.name())
                || r.contains(VaiTro.THU_NGAN.name());
    }

    public boolean chiDuocThaoTacLichLamViecCuaBanThan() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof NguoiDungChinhThuc u)) {
            return false;
        }
        Set<String> r = u.layCacTenVaiTro();
        if (duocQuanLyLichCuaMoiBacSi()) {
            return false;
        }
        return r.contains(VaiTro.BAC_SI.name());
    }

    public void yeuCauDuocTruyCapLichCuaBacSi(Long maBacSi) {
        if (maBacSi == null) {
            throw new AccessDeniedException("Thiếu mã bác sĩ.");
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof NguoiDungChinhThuc chuThe)) {
            return;
        }
        Set<String> vaiTro = chuThe.layCacTenVaiTro();
        if (vaiTro.contains(VaiTro.QUAN_TRI.name())
                || vaiTro.contains(VaiTro.LE_TAN.name())
                || vaiTro.contains(VaiTro.THU_NGAN.name())) {
            return;
        }
        if (!vaiTro.contains(VaiTro.BAC_SI.name())) {
            return;
        }
        BacSi bs = bacSiRepository.findByNguoiDung_Id(chuThe.getMaNguoiDung())
                .orElseThrow(() -> new AccessDeniedException("Tài khoản chưa liên kết hồ sơ bác sĩ."));
        if (!bs.getId().equals(maBacSi)) {
            throw new AccessDeniedException("Chỉ được xem lịch của chính mình.");
        }
    }
}
