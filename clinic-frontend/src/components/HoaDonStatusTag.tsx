import { Badge } from "react-bootstrap";

const META: Record<
  string,
  { label: string; bg: string; text?: "dark" | "light" | "white" }
> = {
  CHO_THANH_TOAN: { label: "Chờ thanh toán", bg: "warning", text: "dark" },
  MOT_PHAN: { label: "Thanh toán một phần", bg: "info" },
  DA_THANH_TOAN: { label: "Đã thanh toán", bg: "success" },
  HUY: { label: "Đã hủy", bg: "secondary" },
};

export function labelTrangThaiHoaDon(code?: string): string {
  if (!code) return "—";
  return META[code]?.label ?? code;
}

type Props = {
  trangThai?: string;
  className?: string;
};

export function HoaDonStatusTag({ trangThai, className }: Props) {
  const m = trangThai ? META[trangThai] : undefined;
  if (m) {
    return (
      <Badge bg={m.bg} text={m.text} className={className}>
        {m.label}
      </Badge>
    );
  }
  return (
    <Badge bg="secondary" className={className}>
      {trangThai ?? "—"}
    </Badge>
  );
}
