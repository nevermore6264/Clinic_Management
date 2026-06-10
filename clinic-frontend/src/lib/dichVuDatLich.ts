import type { DichVu, LoaiDichVu } from "@/lib/api";

export function loaiDichVuBenhNhanTuDat(
  loai?: Pick<LoaiDichVu, "benhNhanTuDat"> | null,
): boolean {
  return loai?.benhNhanTuDat !== false;
}

export function dichVuBenhNhanTuDat(d: Pick<DichVu, "benhNhanTuDat">): boolean {
  return d.benhNhanTuDat !== false;
}

export function dichVuChuyenSau(d: Pick<DichVu, "benhNhanTuDat">): boolean {
  return d.benhNhanTuDat === false;
}

export function dichVuChoDatLich(d: DichVu): boolean {
  return d.hoatDong !== false && dichVuBenhNhanTuDat(d);
}

export function dichVuChoChiDinhTrongKham(d: DichVu): boolean {
  return d.hoatDong !== false && dichVuChuyenSau(d);
}
