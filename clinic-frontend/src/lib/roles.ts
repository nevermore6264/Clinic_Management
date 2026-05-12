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

/** Quản trị hoặc lễ tân — chỉ ghi nhận thanh toán thủ công, không dùng PayOS QR trên màn chi tiết. */
export function laQuanTriHoacLeTan(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!user?.cacVaiTro?.length) return false;
  const r = user.cacVaiTro;
  return r.includes("QUAN_TRI") || r.includes("LE_TAN");
}

export function laChiTaiKhoanBenhNhan(user: NguoiDung | null): boolean {
  if (!user?.cacVaiTro?.length) return false;
  return user.cacVaiTro.includes("BENH_NHAN") && !laNhanVien(user);
}

export function laBacSiChiDocBenhNhan(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!laNhanVien(user) || !user?.cacVaiTro?.length) return false;
  const r = user.cacVaiTro;
  if (!r.includes("BAC_SI")) return false;
  if (r.includes("QUAN_TRI") || r.includes("LE_TAN")) return false;
  return true;
}

export function laChiTaiKhoanBacSiXemLichHomNay(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!laNhanVien(user) || !user?.cacVaiTro?.length) return false;
  const r = user.cacVaiTro;
  if (!r.includes("BAC_SI")) return false;
  if (
    r.includes("QUAN_TRI") ||
    r.includes("LE_TAN") ||
    r.includes("THU_NGAN")
  ) {
    return false;
  }
  return true;
}

export function laBacSiKhongXemHoaDon(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  return laChiTaiKhoanBacSiXemLichHomNay(user);
}

export function laBacSiChiXemLichLamViecCuaBanThan(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  return laChiTaiKhoanBacSiXemLichHomNay(user);
}

export function laCoTuDongBaoVangLichHen(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!laNhanVien(user) || !user?.cacVaiTro?.length) return false;
  const r = user.cacVaiTro;
  return r.includes("QUAN_TRI") || r.includes("LE_TAN") || r.includes("BAC_SI");
}
