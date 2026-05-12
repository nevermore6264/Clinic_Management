import type { NguoiDung } from "@/lib/useAuth";

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

export function laChiTaiKhoanBenhNhan(user: NguoiDung | null): boolean {
  if (!user?.cacVaiTro?.length) return false;
  return user.cacVaiTro.includes("BENH_NHAN") && !laNhanVien(user);
}

/** Bác sĩ thuần (có BAC_SI, không kèm quản trị/lễ tân): chỉ xem danh sách & chi tiết bệnh nhân, không thêm/sửa. */
export function laBacSiChiDocBenhNhan(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!laNhanVien(user) || !user?.cacVaiTro?.length) return false;
  const r = user.cacVaiTro;
  if (!r.includes("BAC_SI")) return false;
  if (r.includes("QUAN_TRI") || r.includes("LE_TAN")) return false;
  return true;
}

/**
 * Bác sĩ thuần (có BAC_SI, không quản trị / lễ tân / thu ngân): trang lịch hẹn chỉ hôm nay, không đặt lịch.
 */
export function laChiTaiKhoanBacSiXemLichHomNay(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!laNhanVien(user) || !user?.cacVaiTro?.length) return false;
  const r = user.cacVaiTro;
  if (!r.includes("BAC_SI")) return false;
  if (r.includes("QUAN_TRI") || r.includes("LE_TAN") || r.includes("THU_NGAN")) {
    return false;
  }
  return true;
}
