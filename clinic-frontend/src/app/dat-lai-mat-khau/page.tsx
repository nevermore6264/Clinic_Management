"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { authApi } from "@/lib/api";
import { getLandingPublic } from "@/lib/landingPublicContent";
import { LoginBackgroundDecor } from "@/components/LoginBackgroundDecor";

type FieldKey = "new" | "confirm";

function ResetPasswordInner() {
  const lp = getLandingPublic();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [kiemTra, setKiemTra] = useState<"dang" | "hopLe" | "khongHopLe">(
    "dang",
  );
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<
    Partial<Record<FieldKey, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [thanhCong, setThanhCong] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token.trim()) {
      setKiemTra("khongHopLe");
      return;
    }
    authApi
      .kiemTraMaKhoiPhuc(token)
      .then((res) => {
        if (cancelled) return;
        setKiemTra(res?.hopLe ? "hopLe" : "khongHopLe");
      })
      .catch(() => {
        if (!cancelled) setKiemTra("khongHopLe");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const clearField = (k: FieldKey) =>
    setFieldError((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err: Partial<Record<FieldKey, string>> = {};
    if (!matKhauMoi.trim()) err.new = "Vui lòng nhập mật khẩu mới.";
    else if (matKhauMoi.length < 6) err.new = "Mật khẩu cần ít nhất 6 ký tự.";
    if (!xacNhan.trim()) err.confirm = "Vui lòng nhập lại mật khẩu mới.";
    else if (matKhauMoi && matKhauMoi !== xacNhan)
      err.confirm = "Xác nhận không khớp với mật khẩu mới.";
    if (Object.keys(err).length) {
      setFieldError(err);
      return;
    }
    setLoading(true);
    try {
      await authApi.datLaiMatKhau(token, matKhauMoi);
      setThanhCong(true);
      setTimeout(() => router.replace("/dang-nhap"), 2500);
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.message?.trim()
          ? err.message.trim()
          : "Đặt lại mật khẩu thất bại. Liên kết có thể đã hết hạn.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <LoginBackgroundDecor />
      <Link href="/dang-nhap" className="login-back-home">
        <i className="bi bi-arrow-left" aria-hidden />
        <span>Về đăng nhập</span>
      </Link>
      <div className="d-flex align-items-center justify-content-center min-vh-100 px-3">
        <div
          className="login-form-wrap login-form-wrap--animate w-100"
          style={{ maxWidth: 460 }}
        >
          <Card className="login-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <div className="login-card__accent" aria-hidden />
              <div className="login-card__glow" aria-hidden />
              <div className="text-center mb-4">
                <div className="login-card__icon-ring mx-auto mb-3">
                  <i className="bi bi-shield-lock" aria-hidden />
                </div>
                <h2 className="login-card__heading mb-1">Đặt lại mật khẩu</h2>
                <p className="text-muted small mb-0">
                  Tạo mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              {kiemTra === "dang" ? (
                <div className="text-center text-muted py-4">
                  <Spinner animation="border" variant="primary" className="mb-2" />
                  <div className="small">Đang kiểm tra liên kết…</div>
                </div>
              ) : kiemTra === "khongHopLe" ? (
                <>
                  <Alert
                    variant="danger"
                    className="d-flex align-items-start gap-2 border-0 login-alert"
                  >
                    <i className="bi bi-x-octagon flex-shrink-0 mt-1" />
                    <span className="small">
                      Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui
                      lòng yêu cầu liên kết mới.
                    </span>
                  </Alert>
                  <div className="d-grid">
                    <Link href="/quen-mat-khau" className="btn btn-primary py-2">
                      <i className="bi bi-arrow-repeat me-2" aria-hidden />
                      Yêu cầu liên kết mới
                    </Link>
                  </div>
                </>
              ) : thanhCong ? (
                <>
                  <Alert
                    variant="success"
                    className="d-flex align-items-start gap-2 border-0 login-alert"
                  >
                    <i className="bi bi-check-circle flex-shrink-0 mt-1" />
                    <span className="small">
                      Đặt lại mật khẩu thành công! Đang chuyển tới trang đăng
                      nhập…
                    </span>
                  </Alert>
                  <div className="d-grid">
                    <Link href="/dang-nhap" className="btn btn-primary py-2">
                      <i className="bi bi-box-arrow-in-right me-2" aria-hidden />
                      Đăng nhập ngay
                    </Link>
                  </div>
                </>
              ) : (
                <Form noValidate onSubmit={handleSubmit} className="login-form">
                  {error && (
                    <Alert
                      variant="danger"
                      className="d-flex align-items-start gap-2 border-0 login-alert"
                    >
                      <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" />
                      <span className="small">{error}</span>
                    </Alert>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                      Mật khẩu mới
                    </Form.Label>
                    <InputGroup className="login-password-group">
                      <InputGroup.Text className="login-input-icon">
                        <i className="bi bi-key" aria-hidden />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={matKhauMoi}
                        onChange={(e) => {
                          setMatKhauMoi(e.target.value);
                          clearField("new");
                          clearField("confirm");
                        }}
                        autoComplete="new-password"
                        placeholder="Tối thiểu 6 ký tự"
                        className="login-input login-input--mid py-2"
                        isInvalid={Boolean(fieldError.new)}
                      />
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="login-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        <i
                          className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                          aria-hidden
                        />
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {fieldError.new}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">
                      Xác nhận mật khẩu mới
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="login-input-icon">
                        <i className="bi bi-key-fill" aria-hidden />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={xacNhan}
                        onChange={(e) => {
                          setXacNhan(e.target.value);
                          clearField("confirm");
                        }}
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="login-input py-2"
                        isInvalid={Boolean(fieldError.confirm)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldError.confirm}
                      </Form.Control.Feedback>
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
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2" aria-hidden />
                        Đặt lại mật khẩu
                      </>
                    )}
                  </Button>
                </Form>
              )}
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

export default function ResetPasswordPage() {
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
      <ResetPasswordInner />
    </Suspense>
  );
}
