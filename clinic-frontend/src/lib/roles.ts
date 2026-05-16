import type { NguoiDung } from "@/lib/useAuth";

export const VAI_TRO_NHAN_VIEN = [
  "QUAN_TRI",
  "LE_TAN",
  "BAC_SI",
  "THU_NGAN",
] as const;

export const VAI_TRO_LABEL: Record<string, string> = {
  QUAN_TRI: "Quản trị",
  LE_TAN: "Lễ tân",
  BAC_SI: "Bác sĩ",
  THU_NGAN: "Thu ngân",
  BENH_NHAN: "Bệnh nhân",
};

export const VAI_TRO_BADGE_CLASS: Record<string, string> = {
  QUAN_TRI: "user-role-tag--admin",
  LE_TAN: "user-role-tag--reception",
  BAC_SI: "user-role-tag--doctor",
  THU_NGAN: "user-role-tag--cashier",
  BENH_NHAN: "user-role-tag--patient",
};

/** Vai trò nội bộ theo thứ tự ưu tiên hiển thị (chat, danh sách). */
export function sapXepVaiTroNoiBo(cacVaiTro?: Iterable<string> | null): string[] {
  if (!cacVaiTro) return [];
  const co = new Set(cacVaiTro);
  return VAI_TRO_NHAN_VIEN.filter((r) => co.has(r));
}

export function nhanVaiTro(vaiTro: string): string {
  return VAI_TRO_LABEL[vaiTro] ?? vaiTro;
}

export function chuoiVaiTroNoiBo(cacVaiTro?: Iterable<string> | null): string {
  return sapXepVaiTroNoiBo(cacVaiTro)
    .map((r) => nhanVaiTro(r))
    .join(", ");
}

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

export function laDuocGuiEmailNhacLichThuCong(
  user: Pick<NguoiDung, "cacVaiTro"> | null,
): boolean {
  if (!user?.cacVaiTro?.length) return false;
  return user.cacVaiTro.some(
    (r) => r === "QUAN_TRI" || r === "LE_TAN" || r === "THU_NGAN",
  );
}
