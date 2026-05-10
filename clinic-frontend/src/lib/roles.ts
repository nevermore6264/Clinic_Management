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
