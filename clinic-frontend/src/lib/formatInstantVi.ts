export function formatInstantVi(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const ngay = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const gio = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${ngay} · ${gio}`;
}

export function formatNgayHenDayVi(ngayHen?: string): string {
  if (!ngayHen) return "—";
  const d = new Date(ngayHen.includes("T") ? ngayHen : `${ngayHen}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ngayHen;
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatGioHen(gioHen?: string): string {
  if (!gioHen) return "—";
  return gioHen.length >= 5 ? gioHen.slice(0, 5) : gioHen;
}
