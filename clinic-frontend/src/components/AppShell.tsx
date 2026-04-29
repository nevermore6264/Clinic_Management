"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { AppFooter } from "@/components/AppFooter";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthScreen = pathname === "/dang-nhap";
  const isLandingScreen = pathname === "/";
  const hideChrome = isAuthScreen || isLandingScreen;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.classList.add("app-ready");

    // Auto apply scroll-reveal cho hầu hết block UI phổ biến.
    const targets = Array.from(
      document.querySelectorAll(
        [
          ".page-shell section",
          ".page-shell .card",
          ".page-shell .table-responsive",
          ".page-shell .list-group-item",
          ".page-shell .stat-card",
          ".page-shell .landing-feature-card",
          ".page-shell .process-step",
          ".page-shell .testimonial-card",
          ".page-shell .landing-faq__item",
          ".page-shell [data-reveal]",
        ].join(","),
      ),
    ) as HTMLElement[];

    targets.forEach((el, i) => {
      if (el.classList.contains("reveal-disabled")) return;
      el.classList.add("reveal-on-scroll");
      el.style.setProperty("--reveal-delay", `${Math.min(i % 8, 7) * 55}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      {!hideChrome && <NavBar />}
      <main
        className={
          hideChrome
            ? "flex-grow-1 page-main page-main--auth d-flex flex-column"
            : "flex-grow-1 page-main"
        }
      >
        <div
          className={
            hideChrome
              ? "login-viewport flex-grow-1 d-flex flex-column w-100"
              : "page-shell animate-fade-in-up"
          }
        >
          {children}
        </div>
      </main>
      {!hideChrome && <AppFooter />}
    </>
  );
}
