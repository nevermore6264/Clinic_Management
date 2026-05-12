export function formatVndInput(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "";
  }
  return Math.max(0, Math.trunc(Number(value))).toLocaleString("vi-VN");
}

export function parseVndInput(raw: string): number | undefined {
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return undefined;
  const n = Number(digitsOnly);
  return Number.isFinite(n) ? n : undefined;
}

export function formatVndInputMoney(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "";
  }
  const n = Math.max(0, Number(value));
  return n.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function parseVndInputMoney(raw: string): number {
  let s = raw
    .replace(/đ/gi, "")
    .replace(/VNĐ/gi, "")
    .replace(/\s/g, "")
    .trim();
  if (!s) return 0;
  const lastComma = s.lastIndexOf(",");
  if (lastComma !== -1) {
    const intRaw = s.slice(0, lastComma);
    const decPart = s.slice(lastComma + 1).replace(/\D/g, "").slice(0, 2);
    const intPart = intRaw.replace(/\./g, "").replace(/\D/g, "");
    const n = Number(decPart ? `${intPart}.${decPart}` : intPart);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  const intPart = s.replace(/\./g, "").replace(/\D/g, "");
  const n = Number(intPart);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function formatVndInputMoneyUnit(value?: number | null): string {
  const core = formatVndInputMoney(value);
  if (core === "") return "";
  return `${core} VNĐ`;
}
