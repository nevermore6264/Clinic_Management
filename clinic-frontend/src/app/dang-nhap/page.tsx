"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/bang-dieu-khien");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
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

  /* Chỉ treo UI khi đã có phiên và đang chuyển — không chặn vì loading auth */
  if (user) {
    return (
      <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="text-muted small mt-3 mb-0">Đang chuyển trang…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <div className="login-grid">
        <div className="login-brand">
          <div className="login-brand__mark">
            <i className="bi bi-heart-pulse-fill" aria-hidden />
          </div>
          <h1 className="login-brand__title">MEDLATEC Clinic</h1>
          <p className="login-brand__lead">
            Hệ thống quản lý phòng khám thông minh
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

        <div className="login-form-wrap">
          <Card className="login-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <div className="login-card__accent" aria-hidden />
              <div className="text-center mb-4">
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

              <Form onSubmit={handleSubmit} className="login-form">
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
                      required
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
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-key" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="login-input py-2"
                    />
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

              <details className="login-hint mt-4">
                <summary className="text-muted small user-select-none">
                  Tài khoản dùng thử (dev)
                </summary>
                <p className="small text-muted mb-0 mt-2 ps-1 border-start border-2 border-secondary border-opacity-25">
                  <strong>admin</strong> / admin123 · <strong>reception</strong>{" "}
                  / reception123
                </p>
              </details>
            </Card.Body>
          </Card>
          <p className="login-footnote text-center mt-4 mb-0 small">
            © {new Date().getFullYear()} — Hệ thống quản lý phòng khám MEDLATEC
          </p>
        </div>
      </div>
    </div>
  );
}
