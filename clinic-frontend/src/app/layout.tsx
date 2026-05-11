import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "./dashboard-bundle.css";
import { AuthProvider } from "@/lib/useAuth";
import { AppShell } from "@/components/AppShell";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const clinicTitle =
  process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Phòng khám MEDLATEC";

export const metadata: Metadata = {
  title: `${clinicTitle} — Phòng khám đa khoa & đặt lịch khám`,
  description: `Đặt lịch khám trực tuyến, khám đa khoa, xét nghiệm và chăm sóc sức khỏe gia đình tại ${clinicTitle}.`,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-heart-pulse.svg", type: "image/svg+xml" },
      { url: "/favicon-heart.png", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/favicon-heart.png", type: "image/png" }],
    shortcut: ["/favicon-heart-pulse.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${sans.className} d-flex flex-column min-vh-100`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
