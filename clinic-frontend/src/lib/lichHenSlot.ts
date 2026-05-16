export const BUOC_SLOT_PHUT = 30;
export const MS_MOI_SLOT = BUOC_SLOT_PHUT * 60 * 1000;

export function thoiDiemGioHenMs(ngayHen: string, gioHen?: string | null): number {
  const t = (gioHen ?? "00:00").slice(0, 5);
  const [y, m, d] = ngayHen.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  const [hh, mm] = t.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
}

export function slotHopLeDatOnline(
  ngayHen: string,
  gio: string,
  nowMs: number = Date.now(),
): boolean {
  const t = thoiDiemGioHenMs(ngayHen, gio);
  return !Number.isNaN(t) && t > nowMs;
}

export function slotHopLeDatQuay(
  ngayHen: string,
  gio: string,
  nowMs: number = Date.now(),
): boolean {
  const t = thoiDiemGioHenMs(ngayHen, gio);
  return !Number.isNaN(t) && t + MS_MOI_SLOT > nowMs;
}

export function locSlotTheoThoiGian<T extends { gio: string }>(
  slots: T[],
  ngayHen: string,
  homNay: string,
  datTaiQuay: boolean,
  nowMs: number = Date.now(),
): T[] {
  if (!ngayHen || ngayHen !== homNay) return slots;
  return slots.filter((s) =>
    datTaiQuay
      ? slotHopLeDatQuay(ngayHen, s.gio, nowMs)
      : slotHopLeDatOnline(ngayHen, s.gio, nowMs),
  );
}
