"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { getLandingPublic } from "@/lib/landingPublicContent";
import { LANDING_BOOKING_DRAFT_KEY } from "@/lib/landingBookingDraft";
import { LoginBackgroundDecor } from "@/components/LoginBackgroundDecor";

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
                <p className="text-muted small mb-1">
                  Nhân viên dùng tài khoản do quản trị cấp. Bệnh nhân có thể{" "}
                  <Link href="/dang-ky" className="fw-semibold">
                    tạo tài khoản
                  </Link>{" "}
                  để đặt lịch trực tuyến.
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
                    Bạn vừa gửi yêu cầu đặt lịch từ trang chủ. Đăng nhập hoặc{" "}
                    <Link href="/dang-ky?next=/lich-hen">đăng ký tài khoản bệnh nhân</Link>{" "}
                    rồi mở đặt lịch — gợi ý từ form trang chủ sẽ được điền khi phù hợp.
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

              <p className="text-center text-muted small mt-3 mb-0">
                Chưa có tài khoản bệnh nhân?{" "}
                <Link href="/dang-ky" className="fw-semibold">
                  Đăng ký miễn phí
                </Link>
              </p>
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
