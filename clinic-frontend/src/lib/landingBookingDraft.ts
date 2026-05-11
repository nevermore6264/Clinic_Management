export const LANDING_BOOKING_DRAFT_KEY = "landingBookingDraft";

export type LandingBookingDraft = {
  name: string;
  phone: string;
  need: string;
  ts: number;
};

export function consumeLandingBookingDraft(): LandingBookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LANDING_BOOKING_DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(LANDING_BOOKING_DRAFT_KEY);
    const d = JSON.parse(raw) as Partial<LandingBookingDraft>;
    if (typeof d.name !== "string" || typeof d.phone !== "string") return null;
    return {
      name: d.name,
      phone: d.phone,
      need: typeof d.need === "string" ? d.need : "",
      ts: typeof d.ts === "number" ? d.ts : 0,
    };
  } catch {
    return null;
  }
}
