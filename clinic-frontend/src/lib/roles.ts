import type { NguoiDung } from "@/lib/useAuth";

/** Vai trò được coi là nhân viên phòng khám (không phải chỉ bệnh nhân đăng nhập portal). */
export const VAI_TRO_NHAN_VIEN = [
  "QUAN_TRI",
  "LE_TAN",
  "BAC_SI",
  "THU_NGAN",
] as const;

export function laNhanVien(user: Pick<NguoiDung, "cacVaiTro"> | null): boolean {
  if (!user?.cacVaiTro?.length) return false;
  return user.cacVaiTro.some((r) =>
    (VAI_TRO_NHAN_VIEN as readonly string[]).includes(r),
  );
}

/** Tài khoản chỉ có vai trò BENH_NHAN — xem hồ sơ và lịch của chính mình, không như nhân viên. */
export function laChiTaiKhoanBenhNhan(user: NguoiDung | null): boolean {
  if (!user?.cacVaiTro?.length) return false;
  return user.cacVaiTro.includes("BENH_NHAN") && !laNhanVien(user);
}
