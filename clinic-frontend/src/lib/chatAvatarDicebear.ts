/** Avatar SVG (DiceBear) — seed cố định theo người dùng, không đổi mỗi lần load. */

const BASE =
  "https://api.dicebear.com/9.x/notionists/svg";

export function chatAvatarDicebearUrl(
  userId: number,
  hint?: string,
): string {
  const seed = `${userId}-${(hint ?? "user").trim().slice(0, 48)}`;
  return `${BASE}?seed=${encodeURIComponent(seed)}`;
}

export function chatAvatarInitials(name?: string, fallback?: string): string {
  const s = (name?.trim() || fallback?.trim() || "?").slice(0, 2);
  return s.toUpperCase();
}
