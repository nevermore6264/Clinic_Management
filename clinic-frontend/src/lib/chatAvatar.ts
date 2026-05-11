/** Chữ ký tắt 2 ký tự (tên Việt: chữ đầu họ + chữ đầu tên). */
export function chatAvatarInitials(name?: string, fallback?: string): string {
  const raw = (name?.trim() || fallback?.trim() || "?").replace(/\s+/g, " ");
  if (!raw) return "?";
  const parts = raw.split(" ").filter(Boolean);
  const pick = (s: string) => {
    const arr = Array.from(s);
    return arr[0] ?? "";
  };
  if (parts.length >= 2) {
    return (pick(parts[0]) + pick(parts[parts.length - 1])).toUpperCase();
  }
  const arr = Array.from(raw);
  return arr.slice(0, 2).join("").toUpperCase() || "?";
}

/** Bảng màu trầm, phù hợp giao diện phòng khám (không dùng ảnh hoạt hình). */
const AVATAR_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#0d9488", "#0f766e"],
  ["#0369a1", "#1e3a8a"],
  ["#4338ca", "#312e81"],
  ["#7c3aed", "#5b21b6"],
  ["#a21caf", "#86198f"],
  ["#be123c", "#9f1239"],
  ["#c2410c", "#9a3412"],
  ["#b45309", "#92400e"],
  ["#15803d", "#166534"],
  ["#0f766e", "#134e4a"],
  ["#1d4ed8", "#1e40af"],
  ["#475569", "#334155"],
];

export function chatAvatarGradientCss(userId: number): string {
  const i = Math.abs(Math.imul(userId, 2654435761) >>> 0) % AVATAR_GRADIENTS.length;
  const [a, b] = AVATAR_GRADIENTS[i]!;
  return `linear-gradient(145deg, ${a} 0%, ${b} 100%)`;
}
