import { Badge } from "react-bootstrap";

const META: Record<
  string,
  { label: string; bg: string; text?: "dark" | "light" | "white" }
> = {
  TIEN_MAT: { label: "Tiền mặt", bg: "success" },
  THE: { label: "Thẻ", bg: "info" },
  CHUYEN_KHOAN: { label: "Chuyển khoản", bg: "secondary" },
  TRUC_TUYEN: { label: "Trực tuyến", bg: "primary" },
};

export function labelPhuongThucThanhToan(code?: string): string {
  if (!code) return "—";
  return META[code]?.label ?? code;
}

type Props = {
  phuongThuc?: string;
  className?: string;
};

export function PhuongThucThanhToanTag({ phuongThuc, className }: Props) {
  const m = phuongThuc ? META[phuongThuc] : undefined;
  if (m) {
    return (
      <Badge bg={m.bg} text={m.text} className={className}>
        {m.label}
      </Badge>
    );
  }
  return (
    <Badge bg="light" text="dark" className={className}>
      {phuongThuc ?? "—"}
    </Badge>
  );
}
