export function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayLocalYmd(): string {
  return localYmd(new Date());
}

export function daysAgoLocalYmd(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localYmd(d);
}
