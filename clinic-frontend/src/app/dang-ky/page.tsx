"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { getLandingPublic } from "@/lib/landingPublicContent";
import { LANDING_BOOKING_DRAFT_KEY } from "@/lib/landingBookingDraft";
import { LoginBackgroundDecor } from "@/components/LoginBackgroundDecor";

function readBookingDraftNoConsume(): {
  name: string;
  phone: string;
  need: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LANDING_BOOKING_DRAFT_KEY);
    if (!raw?.trim()) return null;
    const d = JSON.parse(raw) as Partial<{
      name: string;
      phone: string;
      need: string;
    }>;
    if (typeof d.name !== "string" || typeof d.phone !== "string") return null;
    return {
      name: d.name,
      phone: d.phone,
      need: typeof d.need === "string" ? d.need : "",
    };
  } catch {
    return null;
  }
}

function clearBookingDraft() {
  try {
    sessionStorage.removeItem(LANDING_BOOKING_DRAFT_KEY);
  } catch {}
}

function RegisterPageInner() {
  const lp = getLandingPublic();
  const searchParams = useSearchParams();
  const { registerPatient, user } = useAuth();
  const router = useRouter();

  const [hoTen, setHoTen] = useState("");
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [matKhau2, setMatKhau2] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [thuDienTu, setThuDienTu] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = readBookingDraftNoConsume();
    if (draft) {
      setHoTen((prev) => (prev.trim() ? prev : draft.name));
      setSoDienThoai((prev) => (prev.trim() ? prev : draft.phone));
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
    const ht = hoTen.trim();
    const u = tenDangNhap.trim();
    if (!ht) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (!u) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }
    if (u.length < 3) {
      setError("Tên đăng nhập nên có ít nhất 3 ký tự.");
      return;
    }
    if (!matKhau || matKhau.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (matKhau !== matKhau2) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      await registerPatient({
        tenDangNhap: u,
        matKhau,
        hoTen: ht,
        soDienThoai: soDienThoai.trim() || undefined,
        thuDienTu: thuDienTu.trim() || undefined,
      });
      clearBookingDraft();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message?.trim()
          ? err.message.trim()
          : "Đăng ký thất bại";
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
              <i className="bi bi-person-plus me-1" aria-hidden />
              Dành cho bệnh nhân
            </span>
            <div className="login-brand__mark">
              <i className="bi bi-heart-pulse-fill" aria-hidden />
            </div>
            <h1 className="login-brand__title">{lp.clinicName}</h1>
            <p className="login-brand__lead">
              Tạo tài khoản để đặt lịch khám trực tuyến, xem hồ sơ và hóa đơn
              của bạn sau khi đăng nhập.
            </p>
            <ul className="login-brand__features">
              <li>
                <i className="bi bi-check-circle-fill" aria-hidden />
                Đặt lịch theo khung giờ còn trống
              </li>
              <li>
                <i className="bi bi-check-circle-fill" aria-hidden />
                Cập nhật thông tin liên hệ trong hồ sơ
              </li>
              <li>
                <i className="bi bi-check-circle-fill" aria-hidden />
                Theo dõi lịch khám &amp; thanh toán
              </li>
            </ul>
          </div>
        </div>

        <div className="login-form-wrap login-form-wrap--animate">
          <Card className="login-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <div className="login-card__accent" aria-hidden />
              <div className="login-card__glow" aria-hidden />
              <div className="text-center mb-4">
                <div className="login-card__icon-ring mx-auto mb-3">
                  <i className="bi bi-person-plus" aria-hidden />
                </div>
                <h2 className="login-card__heading mb-1">Đăng ký bệnh nhân</h2>
                <p className="text-muted small mb-0">
                  Đã có tài khoản?{" "}
                  <Link href="/dang-nhap" className="fw-semibold">
                    Đăng nhập
                  </Link>
                </p>
              </div>

              {error ? (
                <Alert
                  variant="danger"
                  className="d-flex align-items-start gap-2 border-0 login-alert"
                >
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" />
                  <span className="small">{error}</span>
                </Alert>
              ) : null}

              <Form noValidate onSubmit={handleSubmit} className="login-form">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">
                    Họ và tên <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-person-vcard" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      value={hoTen}
                      onChange={(e) => setHoTen(e.target.value)}
                      autoComplete="name"
                      placeholder="Như trên CCCD / giấy khám"
                      className="login-input py-2"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">
                    Tên đăng nhập <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-person" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      value={tenDangNhap}
                      onChange={(e) => setTenDangNhap(e.target.value)}
                      autoComplete="username"
                      placeholder="Chữ, số — dùng khi đăng nhập"
                      className="login-input py-2"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">
                    Số điện thoại
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-telephone" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      value={soDienThoai}
                      onChange={(e) => setSoDienThoai(e.target.value)}
                      autoComplete="tel"
                      placeholder="Để phòng khám liên hệ (tuỳ chọn)"
                      className="login-input py-2"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">
                    Email
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-envelope" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      value={thuDienTu}
                      onChange={(e) => setThuDienTu(e.target.value)}
                      autoComplete="email"
                      placeholder="Tuỳ chọn"
                      className="login-input py-2"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary">
                    Mật khẩu <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup className="login-password-group">
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-key" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={matKhau}
                      onChange={(e) => setMatKhau(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 6 ký tự"
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
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-secondary">
                    Nhập lại mật khẩu <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="login-input-icon">
                      <i className="bi bi-shield-check" aria-hidden />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={matKhau2}
                      onChange={(e) => setMatKhau2(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Giống mật khẩu phía trên"
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
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check me-2" />
                      Đăng ký &amp; đăng nhập
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <p className="login-footnote text-center mt-4 mb-0 small">
            © {new Date().getFullYear()} — {lp.clinicName}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPatientPage() {
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
      <RegisterPageInner />
    </Suspense>
  );
}
