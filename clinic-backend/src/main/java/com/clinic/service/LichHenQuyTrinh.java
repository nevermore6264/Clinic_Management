package com.clinic.service;

import com.clinic.entity.LichHen;
import com.clinic.entity.VaiTro;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

final class LichHenQuyTrinh {

    private static final List<LichHen.TrangThaiLichHen> QUY_TRINH_CHINH = List.of(
            LichHen.TrangThaiLichHen.DA_DAT,
            LichHen.TrangThaiLichHen.DA_TIEP_NHAN,
            LichHen.TrangThaiLichHen.DANG_KHAM,
            LichHen.TrangThaiLichHen.XET_NGHIEM,
            LichHen.TrangThaiLichHen.DA_KE_DON,
            LichHen.TrangThaiLichHen.CHO_THANH_TOAN,
            LichHen.TrangThaiLichHen.DA_THANH_TOAN
    );

    private LichHenQuyTrinh() {
    }

    static void xacThucChuyenTrangThai(
            LichHen.TrangThaiLichHen cu,
            LichHen.TrangThaiLichHen moi,
            Set<String> vaiTro) {
        if (cu == moi) {
            return;
        }
        if (cu == LichHen.TrangThaiLichHen.DA_THANH_TOAN) {
            throw new RuntimeException(
                    "Lịch đã thanh toán — không thể đổi trạng thái. Xem hóa đơn nếu cần tra cứu.");
        }
        if (vaiTro.contains(VaiTro.QUAN_TRI.name())) {
            return;
        }

        if (moi == LichHen.TrangThaiLichHen.HUY || moi == LichHen.TrangThaiLichHen.VANG) {
            if (cu != LichHen.TrangThaiLichHen.DA_DAT) {
                throw new RuntimeException(
                        "Chỉ đánh dấu hủy / không đến khi lịch còn « Đã đặt » (chưa tiếp nhận). Liên hệ quản trị nếu cần ngoại lệ.");
            }
            if (!coVaiTroChuyenToi(moi, vaiTro)) {
                throw new RuntimeException("Bạn không có quyền đánh dấu trạng thái này.");
            }
            return;
        }

        if (cu == LichHen.TrangThaiLichHen.HUY || cu == LichHen.TrangThaiLichHen.VANG) {
            throw new RuntimeException(
                    "Lịch đã kết thúc (hủy / không đến). Liên hệ quản trị để xử lý ngoại lệ.");
        }

        int idxCu = QUY_TRINH_CHINH.indexOf(cu);
        int idxMoi = QUY_TRINH_CHINH.indexOf(moi);
        if (idxCu < 0 || idxMoi < 0) {
            throw new RuntimeException("Không thể chuyển trạng thái theo quy trình.");
        }
        if (idxMoi != idxCu + 1) {
            if (idxMoi < idxCu) {
                throw new RuntimeException(
                        "Không được lùi bước trong quy trình. Liên hệ quản trị nếu cần sửa.");
            }
            throw new RuntimeException(
                    "Chỉ chuyển sang bước kế tiếp trong quy trình. Liên hệ quản trị nếu cần nhảy bước.");
        }
        if (!coVaiTroChuyenToi(moi, vaiTro)) {
            throw new RuntimeException("Vai trò của bạn không được chuyển sang bước này.");
        }
    }

    private static boolean coVaiTroChuyenToi(LichHen.TrangThaiLichHen dich, Set<String> vaiTro) {
        EnumSet<VaiTro> choPhep = switch (dich) {
            case DA_TIEP_NHAN -> EnumSet.of(VaiTro.LE_TAN);
            case DANG_KHAM, XET_NGHIEM, DA_KE_DON -> EnumSet.of(VaiTro.BAC_SI);
            case CHO_THANH_TOAN -> EnumSet.of(VaiTro.THU_NGAN, VaiTro.LE_TAN);
            case DA_THANH_TOAN -> EnumSet.of(VaiTro.THU_NGAN);
            case HUY -> EnumSet.of(VaiTro.LE_TAN);
            case VANG -> EnumSet.of(VaiTro.LE_TAN, VaiTro.BAC_SI);
            default -> EnumSet.noneOf(VaiTro.class);
        };
        return choPhep.stream().anyMatch(v -> vaiTro.contains(v.name()));
    }
}
