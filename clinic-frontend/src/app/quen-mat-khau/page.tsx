"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { authApi } from "@/lib/api";
import { getLandingPublic } from "@/lib/landingPublicContent";
import { LoginBackgroundDecor } from "@/components/LoginBackgroundDecor";

export default function ForgotPasswordPage() {
  const lp = getLandingPublic();
  const [dinhDanh, setDinhDanh] = useState("");
  const [error, setError] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [loading, setLoading] = useState(false);
  const [daGui, setDaGui] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = dinhDanh.trim();
    if (!v) {
      setError("Vui lòng nhập tên đăng nhập hoặc email.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.quenMatKhau(v);
      setThongBao(
        res?.thongBao ||
          "Nếu tài khoản tồn tại và có email, hệ thống đã gửi liên kết đặt lại mật khẩu.",
      );
      setDaGui(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.message?.trim()
          ? err.message.trim()
          : "Không gửi được yêu cầu. Vui lòng thử lại sau.",
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
        <div className="login-form-wrap login-form-wrap--animate w-100" style={{ maxWidth: 460 }}>
          <Card className="login-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <div className="login-card__accent" aria-hidden />
              <div className="login-card__glow" aria-hidden />
              <div className="text-center mb-4">
                <div className="login-card__icon-ring mx-auto mb-3">
                  <i className="bi bi-key" aria-hidden />
                </div>
                <h2 className="login-card__heading mb-1">Quên mật khẩu</h2>
                <p className="text-muted small mb-0">
                  Nhập tên đăng nhập hoặc email của bạn. Chúng tôi sẽ gửi liên
                  kết đặt lại mật khẩu tới email gắn với tài khoản.
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

              {daGui ? (
                <>
                  <Alert
                    variant="success"
                    className="d-flex align-items-start gap-2 border-0 login-alert"
                  >
                    <i className="bi bi-envelope-check flex-shrink-0 mt-1" />
                    <span className="small">{thongBao}</span>
                  </Alert>
                  <p className="text-muted small">
                    Liên kết có hiệu lực trong 30 phút. Không thấy thư? Kiểm tra
                    hộp thư rác, hoặc{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 align-baseline"
                      onClick={() => {
                        setDaGui(false);
                        setThongBao("");
                      }}
                    >
                      gửi lại
                    </Button>
                    .
                  </p>
                  <div className="d-grid">
                    <Link href="/dang-nhap" className="btn btn-primary py-2">
                      <i className="bi bi-box-arrow-in-right me-2" aria-hidden />
                      Về trang đăng nhập
                    </Link>
                  </div>
                </>
              ) : (
                <Form noValidate onSubmit={handleSubmit} className="login-form">
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">
                      Tên đăng nhập hoặc email
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="login-input-icon">
                        <i className="bi bi-person" aria-hidden />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        value={dinhDanh}
                        onChange={(e) => setDinhDanh(e.target.value)}
                        autoComplete="username"
                        placeholder="VD: admin hoặc email@vidu.com"
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
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2" aria-hidden />
                        Gửi liên kết đặt lại
                      </>
                    )}
                  </Button>
                </Form>
              )}

              <p className="text-center text-muted small mt-3 mb-0">
                Nhớ lại mật khẩu?{" "}
                <Link href="/dang-nhap" className="fw-semibold">
                  Đăng nhập
                </Link>
              </p>
            </Card.Body>
          </Card>
          <p className="login-footnote text-center mt-4 mb-0 small">
            © {new Date().getFullYear()} — Hệ thống quản lý — {lp.clinicName}
          </p>
        </div>
      </div>
      {!daGui && loading ? (
        <div className="visually-hidden" aria-live="polite">
          <Spinner animation="border" />
        </div>
      ) : null}
    </div>
  );
}
