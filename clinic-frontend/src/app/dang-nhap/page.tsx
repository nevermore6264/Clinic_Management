"use client";

import { Suspense, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { getLandingPublic } from "@/lib/landingPublicContent";
import { LANDING_BOOKING_DRAFT_KEY } from "@/lib/landingBookingDraft";

function LoginBackgroundDecor() {
  const uid = useId().replace(/:/g, "");
  const gWave = `login-decor-wave-${uid}`;
  const gWave2 = `login-decor-wave2-${uid}`;
  const gWave3 = `login-decor-wave3-${uid}`;
  const gTop = `login-decor-top-${uid}`;
  const gRing = `login-decor-ring-${uid}`;
  const gPill = `login-decor-pill-${uid}`;

  return (
    <div className="login-bg__decor" aria-hidden>
      <div className="login-bg__mesh-layer" />
      <div className="login-bg__noise" />

      <svg
        className="login-bg__rings"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 420 420"
      >
        <defs>
          <linearGradient id={gRing} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <circle
          cx="210"
          cy="210"
          r="198"
          fill="none"
          stroke={`url(#${gRing})`}
          strokeWidth="1.25"
          strokeDasharray="52 36"
          opacity="0.85"
        />
        <circle
          cx="210"
          cy="210"
          r="158"
          fill="none"
          stroke="rgba(59, 130, 246, 0.14)"
          strokeWidth="1.75"
          strokeDasharray="18 26"
        />
        <circle
          cx="210"
          cy="210"
          r="118"
          fill="none"
          stroke="rgba(14, 165, 233, 0.12)"
          strokeWidth="2"
          strokeDasharray="8 14"
        />
      </svg>

      <svg
        className="login-bg__wave login-bg__wave--top"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gTop} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#60a5fa" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.11" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gTop})`}
          d="M0,0 L1440,0 L1440,42 C1320,78 1080,18 880,46 C680,74 480,22 280,38 C140,48 0,28 0,58 Z"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--cross"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 280 280"
      >
        <circle
          cx="140"
          cy="140"
          r="132"
          fill="none"
          stroke="rgba(37, 99, 235, 0.13)"
          strokeWidth="2"
        />
        <circle
          cx="140"
          cy="140"
          r="108"
          fill="none"
          stroke="rgba(56, 189, 248, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="8 14"
        />
        <path
          d="M140 72v136M72 140h136"
          stroke="rgba(37, 99, 235, 0.16)"
          strokeWidth="20"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--ecg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 520 100"
      >
        <path
          d="M0 50 H72 L82 50 L92 14 L102 88 L112 50 H188 L198 50 L208 20 L220 82 L232 50 H304 L316 50 L328 12 L342 90 L354 50 H520"
          fill="none"
          stroke="rgba(37, 99, 235, 0.18)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--ecg2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 380 72"
      >
        <path
          d="M0 36 H52 L62 36 L72 8 L82 64 L92 36 H160 L172 36 L182 14 L194 58 L206 36 H380"
          fill="none"
          stroke="rgba(14, 165, 233, 0.16)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--pills"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 340 56"
      >
        <defs>
          <linearGradient id={gPill} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="14"
          width="100"
          height="28"
          rx="14"
          fill="none"
          stroke={`url(#${gPill})`}
          strokeWidth="1.5"
        />
        <rect
          x="120"
          y="14"
          width="100"
          height="28"
          rx="14"
          fill="none"
          stroke={`url(#${gPill})`}
          strokeWidth="1.5"
          opacity="0.75"
        />
        <rect
          x="236"
          y="14"
          width="100"
          height="28"
          rx="14"
          fill="none"
          stroke={`url(#${gPill})`}
          strokeWidth="1.5"
          opacity="0.55"
        />
        <circle cx="54" cy="28" r="5.5" fill="rgba(37, 99, 235, 0.2)" />
        <circle cx="170" cy="28" r="5.5" fill="rgba(56, 189, 248, 0.2)" />
        <circle cx="286" cy="28" r="5.5" fill="rgba(14, 165, 233, 0.18)" />
      </svg>

      <svg
        className="login-bg__wave login-bg__wave--mid"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gWave3} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.07" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gWave3})`}
          d="M0,80 C180,40 360,120 540,70 C720,20 900,100 1080,55 C1200,28 1320,48 1440,35 L1440,120 L0,120 Z"
        />
      </svg>

      <svg
        className="login-bg__wave login-bg__wave--bottom"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gWave} x1="0%" y1="0%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.16" />
            <stop offset="35%" stopColor="#2563eb" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id={gWave2} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gWave2})`}
          opacity="0.88"
          d="M0,120 C200,180 360,60 540,100 C720,140 880,40 1080,88 C1210,118 1340,98 1440,108 L1440,220 L0,220 Z"
        />
        <path
          fill={`url(#${gWave})`}
          d="M0,148 C220,96 400,188 620,132 C820,82 980,168 1180,124 C1300,102 1380,138 1440,128 L1440,220 L0,220 Z"
        />
      </svg>

      <div className="login-bg__dots" />
      <div className="login-bg__blobs" />
      <div className="login-bg__orb login-bg__orb--warm" />
      <div className="login-bg__orb login-bg__orb--cool" />
      <div className="login-bg__shard login-bg__shard--a" />
      <div className="login-bg__shard login-bg__shard--b" />
    </div>
  );
}

function LoginPageInner() {
  const lp = getLandingPublic();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [landingDraftHint, setLandingDraftHint] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LANDING_BOOKING_DRAFT_KEY);
      setLandingDraftHint(!!raw?.trim());
    } catch {
      setLandingDraftHint(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const rawNext = searchParams.get("next");
    let dest = "/bang-dieu-khien";
    if (
      rawNext &&
      rawNext.startsWith("/") &&
      !rawNext.startsWith("//") &&
      !rawNext.includes(":")
    ) {
      dest = rawNext.split(/[?#]/)[0] ?? dest;
    }
    router.replace(dest);
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const u = username.trim();
    if (!u) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      await login(u, password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message?.trim()
          ? err.message.trim()
          : "Đăng nhập thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="login-bg login-bg--redirect d-flex align-items-center justify-content-center min-vh-100">
        <LoginBackgroundDecor />
        <div className="login-redirect-card text-center">
          <div className="login-brand__mark login-brand__mark--sm mx-auto mb-3">
            <i className="bi bi-heart-pulse-fill" aria-hidden />
          </div>
          <Spinner animation="border" variant="primary" role="status" />
          <p className="text-muted small mt-3 mb-0">Đang chuyển trang…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <LoginBackgroundDecor />
      <Link href="/" className="login-back-home">
        <i className="bi bi-arrow-left" aria-hidden />
        <span>Về trang chủ</span>
      </Link>
      <div className="login-grid">
        <div className="login-brand login-brand--animate">
          <div className="login-brand-panel">
            <span className="login-brand__badge">
              <i className="bi bi-shield-lock me-1" aria-hidden />
              Đăng nhập bảo mật
            </span>
            <div className="login-brand__mark">
              <i className="bi bi-heart-pulse-fill" aria-hidden />
            </div>
            <h1 className="login-brand__title">{lp.clinicName}</h1>
            <p className="login-brand__lead">
              Hệ thống quản lý phòng khám — lịch khám, hồ sơ và thanh toán trong
              một luồng rõ ràng.
            </p>
          <ul className="login-brand__features">
            <li>
              <i className="bi bi-check-circle-fill" aria-hidden />
              Lịch khám & nhắc lịch
            </li>
            <li>
              <i className="bi bi-check-circle-fill" aria-hidden />
              Hồ sơ & đơn thuốc
            </li>
            <li>
              <i className="bi bi-check-circle-fill" aria-hidden />
              Thanh toán & báo cáo
            </li>
          </ul>
          <div className="login-brand__highlights">
            <div className="login-highlight">
              <span className="login-highlight__value">99.9%</span>
              <span className="login-highlight__label">Độ ổn định vận hành</span>
            </div>
            <div className="login-highlight">
              <span className="login-highlight__value">24/7</span>
              <span className="login-highlight__label">Nhắc lịch tự động</span>
            </div>
            <div className="login-highlight">
              <span className="login-highlight__value">4 bước</span>
              <span className="login-highlight__label">Luồng khám khép kín</span>
            </div>
          </div>
          </div>
        </div>

        <div className="login-form-wrap login-form-wrap--animate">
          <Card className="login-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <div className="login-card__accent" aria-hidden />
              <div className="login-card__glow" aria-hidden />
              <div className="text-center mb-4">
                <div className="login-card__icon-ring mx-auto mb-3">
                  <i className="bi bi-person-badge" aria-hidden />
                </div>
                <h2 className="login-card__heading mb-1">Đăng nhập</h2>
                <p className="text-muted small mb-0">
                  Nhập tài khoản được cấp bởi quản trị hệ thống
                </p>
              </div>

              {error && (
                <Alert
                  variant="danger"
                  className="d-flex align-items-start gap-2 border-0 login-alert"
                >
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" />
                  <span className="small">{error}</span>
                </Alert>
              )}

              {landingDraftHint && (
                <Alert
                  variant="info"
                  className="d-flex align-items-start gap-2 border-0 login-alert mb-3"
                >
                  <i className="bi bi-calendar2-heart flex-shrink-0 mt-1" />
                  <span className="small">
                    Bạn vừa gửi yêu cầu đặt lịch từ trang chủ. Sau khi đăng nhập,
                    hệ thống sẽ mở form đặt lịch và điền gợi ý nhu cầu khám (nếu
                    có).
                  </span>
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit} className="login-form">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">
                    Tên đăng nhập
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-person" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      placeholder="VD: admin"
                      className="login-input py-2"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-secondary">
                    Mật khẩu
                  </Form.Label>
                  <InputGroup className="login-password-group">
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-key" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="login-input login-input--mid py-2"
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="login-password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      <i
                        className={
                          showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                        }
                        aria-hidden
                      />
                    </Button>
                  </InputGroup>
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-3 login-submit fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2" />
                      Đăng nhập
                    </>
                  )}
                </Button>
              </Form>

            </Card.Body>
          </Card>
          <p className="login-footnote text-center mt-4 mb-0 small">
            © {new Date().getFullYear()} — Hệ thống quản lý — {lp.clinicName}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
          <div className="text-center text-muted small">
            <Spinner animation="border" variant="primary" className="mb-2" />
            <div>Đang tải…</div>
          </div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
