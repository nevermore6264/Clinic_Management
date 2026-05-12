import type { DichVu } from "@/lib/api";

export type DichVuFormErrors = {
  maLoaiDichVu?: string;
  maChuyenKhoa?: string;
  ten?: string;
  gia?: string;
};

function cungMaLoaiDichVu(a: unknown, b: unknown): boolean {
  if (a == null || b == null) return false;
  const na = Number(a);
  const nb = Number(b);
  if (Number.isNaN(na) || Number.isNaN(nb)) return false;
  return na === nb;
}

export function validateDichVuForm(
  f: Partial<DichVu>,
  danhSachHienTai: DichVu[],
  opts?: { excludeId?: number },
): DichVuFormErrors {
  const loi: DichVuFormErrors = {};
  if (!f.maLoaiDichVu) {
    loi.maLoaiDichVu = "Vui lòng chọn loại dịch vụ.";
  }
  if (
    f.maChuyenKhoa == null ||
    Number.isNaN(Number(f.maChuyenKhoa)) ||
    Number(f.maChuyenKhoa) <= 0
  ) {
    loi.maChuyenKhoa = "Vui lòng chọn chuyên khoa.";
  }
  const ten = f.ten?.trim() ?? "";
  if (!ten) {
    loi.ten = "Vui lòng nhập tên dịch vụ.";
  } else if (f.maLoaiDichVu != null) {
    const trungTen = danhSachHienTai.some(
      (d) =>
        d.id !== opts?.excludeId &&
        cungMaLoaiDichVu(d.maLoaiDichVu, f.maLoaiDichVu) &&
        (d.ten?.trim().toLocaleLowerCase() ?? "") === ten.toLocaleLowerCase(),
    );
    if (trungTen) {
      loi.ten = "Đã có dịch vụ cùng tên trong loại này.";
    }
  }
  const gia = f.gia ?? 0;
  if (!gia || gia <= 0) {
    loi.gia = "Đơn giá phải lớn hơn 0.";
  }
  return loi;
}

export function coLoiDichVuForm(loi: DichVuFormErrors): boolean {
  return Object.keys(loi).length > 0;
}
