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
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 2000, marginTop: hideChrome ? 0 : "72px" }}
      >
        {toasts.map((item) => (
          <Toast
            key={item.id}
            bg={
              item.kind === "success"
                ? "success"
                : item.kind === "error"
                  ? "danger"
                  : item.kind === "warning"
                    ? "warning"
                    : "primary"
            }
            onClose={() =>
              setToasts((prev) => prev.filter((toast) => toast.id !== item.id))
            }
            autohide
            delay={item.durationMs}
          >
            <Toast.Header closeButton>
              <strong className="me-auto">{item.title}</strong>
            </Toast.Header>
            <Toast.Body
              className={item.kind === "warning" ? "text-dark" : "text-white"}
            >
              {item.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </>
  );
}
