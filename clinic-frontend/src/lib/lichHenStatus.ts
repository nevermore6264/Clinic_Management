export const LICH_HEN_STATUS_FLOW = [
  {
    value: "DA_DAT",
    label: "Đã đặt",
    icon: "bi-calendar-check",
    slug: "da-dat",
  },
  {
    value: "DA_TIEP_NHAN",
    label: "Tiếp nhận",
    icon: "bi-person-badge",
    slug: "tiep-nhan",
  },
  {
    value: "DANG_KHAM",
    label: "Đang khám",
    icon: "bi-heart-pulse",
    slug: "dang-kham",
  },
  {
    value: "XET_NGHIEM",
    label: "Xét nghiệm",
    icon: "bi-droplet",
    slug: "xet-nghiem",
  },
  {
    value: "DA_KE_DON",
    label: "Đã kê đơn",
    icon: "bi-prescription2",
    slug: "da-ke-don",
  },
  {
    value: "DA_THANH_TOAN",
    label: "Đã thanh toán",
    icon: "bi-cash-stack",
    slug: "da-thanh-toan",
  },
  {
    value: "HUY",
    label: "Đã hủy",
    icon: "bi-x-octagon",
    slug: "huy",
  },
  {
    value: "VANG",
    label: "Không đến",
    icon: "bi-person-x",
    slug: "vang",
  },
] as const;

export const LICH_HEN_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  LICH_HEN_STATUS_FLOW.map((s) => [s.value, s.label]),
);

export function metaTrangThaiLichHen(code: string | undefined) {
  const m = LICH_HEN_STATUS_FLOW.find((s) => s.value === code);
  return (
    m ?? {
      value: code ?? "",
      label: code ?? "—",
      icon: "bi-question-circle",
      slug: "unknown",
    }
  );
}
