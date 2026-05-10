"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toast, ToastContainer } from "react-bootstrap";
import { NavBar } from "@/components/NavBar";
import { AppFooter } from "@/components/AppFooter";
import { subscribeNotify, type NotifyKind } from "@/lib/notify";

type ToastItem = {
  id: string;
  kind: NotifyKind;
  title: string;
  message: string;
  durationMs: number;
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const isAuthScreen = pathname === "/dang-nhap";
  const isLandingScreen = pathname === "/";
  const hideChrome = isAuthScreen || isLandingScreen;

  useEffect(() => {
    const unsubscribe = subscribeNotify((payload) => {
      setToasts((prev) => [...prev, payload]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.classList.add("app-ready");

    
    const targets = Array.from(
      document.querySelectorAll(
        [
          ".page-shell section",
          ".page-shell .card",
          ".page-shell .table-responsive",
          ".page-shell .list-group-item",
          ".page-shell .stat-card",
          ".landing-bg > section.landing-section",
          ".landing-bg > section.landing-hero-institutional",
          ".landing-bg > section.landing-quick-tiles-section",
          ".landing-bg > section.landing-stats-ribbon",
          ".landing-bg > section.landing-bhyt-strip",
          ".landing-bg > section.landing-trust-strip",
          ".landing-marketing-footer",
          ".page-shell .landing-kpi",
          ".page-shell [data-reveal]",
          ".landing-hospital-shell .landing-quick-tiles",
          ".landing-hospital-shell .landing-contact-layout",
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
      <ToastContainer
        position="top-end"
        className={`clinic-toast-container p-3 ${hideChrome ? "clinic-toast-container--no-nav" : ""}`}
      >
        {toasts.map((item) => {
          const kindClass =
            item.kind === "success"
              ? "clinic-toast--success"
              : item.kind === "error"
                ? "clinic-toast--error"
                : item.kind === "warning"
                  ? "clinic-toast--warning"
                  : "clinic-toast--info";
          return (
            <Toast
              key={item.id}
              className={`clinic-toast ${kindClass}`}
              onClose={() =>
                setToasts((prev) =>
                  prev.filter((toast) => toast.id !== item.id),
                )
              }
              autohide
              delay={item.durationMs}
            >
              <Toast.Header closeButton className="clinic-toast__header">
                <strong className="me-auto">{item.title}</strong>
              </Toast.Header>
              <Toast.Body className="clinic-toast__body">
                {item.message}
              </Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </>
  );
}
