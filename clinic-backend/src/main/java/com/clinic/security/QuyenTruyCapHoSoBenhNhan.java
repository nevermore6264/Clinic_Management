package com.clinic.security;

import com.clinic.entity.BenhNhan;
import com.clinic.entity.VaiTro;
import com.clinic.repository.BenhNhanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class QuyenTruyCapHoSoBenhNhan {

    private static final Set<VaiTro> VAI_TRO_NHAN_VIEN = EnumSet.of(
            VaiTro.QUAN_TRI, VaiTro.LE_TAN, VaiTro.BAC_SI, VaiTro.THU_NGAN);

    private final BenhNhanRepository benhNhanRepository;

    public boolean laNhanVien() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof NguoiDungChinhThuc)) {
            return false;
        }
        return ((NguoiDungChinhThuc) auth.getPrincipal()).getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .anyMatch(ten -> {
                    try {
                        return VAI_TRO_NHAN_VIEN.contains(VaiTro.valueOf(ten));
                    } catch (IllegalArgumentException e) {
                        return false;
                    }
                });
    }

    public Optional<Long> layMaBenhNhanLienKetVoiTaiKhoan() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof NguoiDungChinhThuc u)) {
            return Optional.empty();
        }
        return benhNhanRepository.findByNguoiDung_Id(u.getMaNguoiDung()).map(BenhNhan::getId);
    }

    public boolean duocTruyCapHoSoBenhNhan(Long maBenhNhan) {
        if (maBenhNhan == null) return false;
        if (laNhanVien()) return true;
        return layMaBenhNhanLienKetVoiTaiKhoan().filter(maBenhNhan::equals).isPresent();
    }

    public void yeuCauDuocTruyCapHoSo(Long maBenhNhan) {
        if (!duocTruyCapHoSoBenhNhan(maBenhNhan)) {
            throw new AccessDeniedException("Không có quyền truy cập hồ sơ bệnh nhân này.");
        }
    }
}
