import type { DichVu } from "@/lib/api";

export type DichVuFormErrors = {
  maLoaiDichVu?: string;
  ten?: string;
  gia?: string;
};

/** Kiểm tra form thêm/sửa dịch vụ (tiếng Việt, trùng tên trong cùng loại). */
export function validateDichVuForm(
  f: Partial<DichVu>,
  danhSachHienTai: DichVu[],
  opts?: { excludeId?: number },
): DichVuFormErrors {
  const loi: DichVuFormErrors = {};
  if (!f.maLoaiDichVu) {
    loi.maLoaiDichVu = "Vui lòng chọn loại dịch vụ.";
  }
  const ten = f.ten?.trim() ?? "";
  if (!ten) {
    loi.ten = "Vui lòng nhập tên dịch vụ.";
  } else if (f.maLoaiDichVu) {
    const trungTen = danhSachHienTai.some(
      (d) =>
        d.id !== opts?.excludeId &&
        d.maLoaiDichVu === f.maLoaiDichVu &&
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
