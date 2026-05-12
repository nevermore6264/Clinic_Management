export function catTrang<T>(mang: T[], trang: number, kichThuoc: number): T[] {
  const k = Math.max(1, kichThuoc);
  const t = Math.max(0, trang);
  const batDau = t * k;
  return mang.slice(batDau, batDau + k);
}

export function tongSoTrangClient(soPhanTu: number, kichThuoc: number): number {
  const k = Math.max(1, kichThuoc);
  return Math.max(1, Math.ceil(Math.max(0, soPhanTu) / k));
}
