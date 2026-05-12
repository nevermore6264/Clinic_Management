function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatNgayDdMmYyyy(ymd?: string | null): string {
  if (ymd == null || ymd === "") return "—";
  const raw = String(ymd).trim();
  const datePart = raw.includes("T") ? raw.split("T")[0]! : raw;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!m) return raw;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

export function formatNgayDdMmYyyyCoThu(ymd?: string | null): string {
  if (!ymd) return "—";
  const datePart = ymd.includes("T") ? ymd.split("T")[0]! : ymd;
  const mk = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart.trim());
  if (!mk) return formatNgayDdMmYyyy(ymd);
  const y = Number(mk[1]);
  const mo = Number(mk[2]);
  const d = Number(mk[3]);
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return datePart;
  const weekday = dt.toLocaleDateString("vi-VN", { weekday: "long" });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap}, ${formatNgayDdMmYyyy(datePart)}`;
}

export function formatThangMmYyyyLabel(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  if (!m) return ym;
  const [, y, mo] = m;
  return `Tháng ${mo}/${y}`;
}

export function formatInstantVi(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const ngay = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
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
  const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const ymd = ngayHen.includes("T") ? ngayHen.split("T")[0]! : ngayHen;
  return `${cap}, ${formatNgayDdMmYyyy(ymd)}`;
}

export function formatGioHen(gioHen?: string): string {
  if (!gioHen) return "—";
  return gioHen.length >= 5 ? gioHen.slice(0, 5) : gioHen;
}
