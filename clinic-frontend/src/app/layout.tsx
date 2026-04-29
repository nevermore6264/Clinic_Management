import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";
import { AppShell } from "@/components/AppShell";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Phòng khám — Quản lý & lịch hẹn",
  description:
    "Hệ thống quản lý phòng khám, bệnh nhân, lịch khám và thanh toán",
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
