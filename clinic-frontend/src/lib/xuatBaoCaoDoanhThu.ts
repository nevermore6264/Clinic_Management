import type { RevenueReport } from "@/lib/api";
import { getLandingPublic } from "@/lib/landingPublicContent";

export function taiBlobThanhTep(blob: Blob, tenTep: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tenTep;
  a.click();
  URL.revokeObjectURL(url);
}

function formatNgayDoc(s: string): string {
  try {
    const key = (s || "").slice(0, 10);
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("vi-VN");
  } catch {
    return s || "—";
  }
}

function formatTien(n: number): string {
  return `${Math.round(n).toLocaleString("vi-VN")} đ`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function xuatBaoCaoWord(
  rows: RevenueReport[],
  tuNgay: string,
  denNgay: string,
  tongDoanhThu: number,
  tongGiaoDich: number,
) {
  const tenPk = esc(getLandingPublic().clinicName);
  const ngayXuat = new Date().toLocaleString("vi-VN");
  const sorted = [...rows].sort((a, b) => (a.ngay || "").localeCompare(b.ngay || ""));

  const hangDuLieu = sorted
    .map((r, i) => {
      const dt = Number(r.tongDoanhThu ?? 0);
      const gd = Number(r.soLichHen ?? 0);
      return `<tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${esc(formatNgayDoc(r.ngay ?? ""))}</td>
        <td style="text-align:right">${esc(formatTien(dt))}</td>
        <td style="text-align:center">${gd.toLocaleString("vi-VN")}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="vi">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<title>Báo cáo doanh thu ${tuNgay} - ${denNgay}</title>
<style>
  body { font-family: "Times New Roman", serif; font-size: 12pt; }
  h1 { font-size: 16pt; text-align: center; }
  table { border-collapse: collapse; width: 100%; margin-top: 12pt; }
  th, td { border: 1px solid #333; padding: 6px 8px; }
  th { background: #f1f5f9; font-weight: bold; }
  .meta { margin: 8pt 0; }
  .tong { margin-top: 12pt; font-weight: bold; }
</style>
</head>
<body>
  <h1>BÁO CÁO DOANH THU</h1>
  <p class="meta" style="text-align:center"><strong>${tenPk}</strong></p>
  <p class="meta">Kỳ báo cáo: <strong>${esc(formatNgayDoc(tuNgay))}</strong> → <strong>${esc(formatNgayDoc(denNgay))}</strong></p>
  <p class="meta">Ngày xuất: ${esc(ngayXuat)}</p>
  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Ngày</th>
        <th>Doanh thu</th>
        <th>Số giao dịch</th>
      </tr>
    </thead>
    <tbody>
      ${hangDuLieu || '<tr><td colspan="4" style="text-align:center">Không có dữ liệu trong kỳ</td></tr>'}
    </tbody>
  </table>
  <p class="tong">Tổng doanh thu kỳ: ${esc(formatTien(tongDoanhThu))}</p>
  <p class="tong">Tổng giao dịch: ${tongGiaoDich.toLocaleString("vi-VN")}</p>
  <p style="margin-top:24pt;font-size:10pt;color:#666">Tài liệu xuất từ hệ thống quản trị phòng khám.</p>
</body>
</html>`;

  const blob = new Blob(["\uFEFF", html], {
    type: "application/msword;charset=utf-8",
  });
  taiBlobThanhTep(blob, `bao-cao-doanh-thu-${tuNgay}-${denNgay}.doc`);
}
