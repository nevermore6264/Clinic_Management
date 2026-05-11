export type GiaiDoanLichHen =
  | "CHO_TIEP_NHAN"
  | "TRONG_KHAM"
  | "SAU_KHAM"
  | "HOAN_TAT"
  | "HUY_VANG";

export const GIAI_DOAN_LICH_HEN_LABEL: Record<GiaiDoanLichHen, string> = {
  CHO_TIEP_NHAN: "Chờ tiếp nhận",
  TRONG_KHAM: "Trong khám / CLS",
  SAU_KHAM: "Sau khám — chờ thu",
  HOAN_TAT: "Đã hoàn tất",
  HUY_VANG: "Hủy / vắng",
};

export function hrefLichHenTheoNgay(
  tuNgay: string,
  denNgay: string,
  giaiDoan?: GiaiDoanLichHen,
) {
  const q = new URLSearchParams();
  q.set("tuNgay", tuNgay);
  q.set("denNgay", denNgay);
  if (giaiDoan) q.set("giaiDoan", giaiDoan);
  return `/lich-hen?${q.toString()}`;
}
