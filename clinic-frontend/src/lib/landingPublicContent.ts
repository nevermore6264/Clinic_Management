function stripTel(display: string): string {
  return display.replace(/\s/g, "");
}

export type LandingPublicConfig = {
  clinicName: string;
  clinicTagline: string;
  addressFull: string;
  cityLabel: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  zaloUrl: string;
  mapEmbedUrl: string;
};

function deriveCityLabel(address: string): string {
  const m = address.match(/TP\.\s*([^,]+)|Thành phố\s+([^,]+)/i);
  if (m) return (m[1] ?? m[2] ?? "").trim();
  if (address.includes("Đà Nẵng")) return "Đà Nẵng";
  return "Việt Nam";
}

export function getLandingPublic(): LandingPublicConfig {
  const clinicName =
    process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Phòng khám MEDLATEC";
  const addressFull =
    process.env.NEXT_PUBLIC_CLINIC_ADDRESS ??
    "78 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, TP. Đà Nẵng";
  const phoneDisplay =
    process.env.NEXT_PUBLIC_CLINIC_PHONE ?? "0236 389 0123";
  const email =
    process.env.NEXT_PUBLIC_CLINIC_EMAIL ?? "info@medlatec-demo.local";
  const zaloUrl = process.env.NEXT_PUBLIC_ZALO_OA_URL ?? "";
  const mapEmbedUrl = process.env.NEXT_PUBLIC_CLINIC_MAP_EMBED_URL ?? "";

  return {
    clinicName,
    clinicTagline: "Phòng khám đa khoa",
    addressFull,
    cityLabel: deriveCityLabel(addressFull),
    phoneDisplay,
    phoneTel: stripTel(phoneDisplay),
    email,
    zaloUrl,
    mapEmbedUrl,
  };
}

export function buildMapIframeSrc(cfg: LandingPublicConfig): string {
  if (cfg.mapEmbedUrl.trim()) return cfg.mapEmbedUrl.trim();
  return `https://maps.google.com/maps?q=${encodeURIComponent(cfg.addressFull)}&hl=vi&z=15&output=embed`;
}
