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
